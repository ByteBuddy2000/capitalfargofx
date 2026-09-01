import { storage } from './storage';
import {
  User,
  Deposit,
  Investment,
  Withdrawal,
  Transaction,
  LedgerEntry,
  Notification,
  InvestmentPlan,
  AuditAction
} from '../types';

export class LedgerEngine {
  /**
   * Helper to append an immutable ledger entry and calculate strict balance transitions
   */
  private static recordLedger(
    userId: string,
    type: LedgerEntry['type'],
    amount: number,
    direction: 'CREDIT' | 'DEBIT',
    referenceType: LedgerEntry['referenceType'],
    referenceId: string,
    balanceBefore: number,
    balanceAfter: number,
    description: string,
    metadata?: Record<string, any>
  ): LedgerEntry {
    const entry: LedgerEntry = {
      id: `ldg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId,
      type,
      amount,
      asset: 'USD',
      direction,
      referenceType,
      referenceId,
      balanceBefore,
      balanceAfter,
      description,
      metadata,
      createdAt: new Date().toISOString(),
    };

    const currentLedger = storage.getLedger();
    storage.saveLedger([entry, ...currentLedger]);
    return entry;
  }

  /**
   * Helper to send notification
   */
  private static sendNotification(
    userId: string,
    title: string,
    message: string,
    type: Notification['type']
  ): void {
    const notifs = storage.getNotifications();
    const newNotif: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
    };
    storage.saveNotifications([newNotif, ...notifs]);
  }

  /**
   * Step 1: User submits a Deposit request
   */
  static createDepositRequest(
    userId: string,
    planId: string,
    amount: number,
    asset: 'BTC' | 'ETH' | 'USDT',
    network: string,
    receivingAddress: string,
    txHash?: string
  ): { success: boolean; deposit?: Deposit; error?: string } {
    const user = storage.getUserById(userId);
    if (!user) return { success: false, error: 'User not found' };

    const plan = storage.getPlanById(planId);
    if (!plan || plan.status !== 'ACTIVE') {
      return { success: false, error: 'Investment plan is currently inactive or invalid.' };
    }

    if (amount < plan.minimumAmount) {
      return { success: false, error: `Minimum deposit for ${plan.name} is $${plan.minimumAmount.toLocaleString()}` };
    }

    if (plan.maximumAmount > 0 && amount > plan.maximumAmount) {
      return { success: false, error: `Maximum deposit for ${plan.name} is $${plan.maximumAmount.toLocaleString()}` };
    }

    const expectedProfit = (amount * plan.returnPercentage) / 100;
    const totalExpectedReturn = plan.principalReturn ? amount + expectedProfit : expectedProfit;

    const newDeposit: Deposit = {
      id: `dep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      userUsername: user.username,
      userFullName: user.fullName,
      planId: plan.id,
      planName: plan.name,
      amount,
      asset,
      network,
      receivingAddress,
      txHash: txHash || '',
      status: 'PENDING',
      expectedReturnPercentage: plan.returnPercentage,
      durationHours: plan.durationHours,
      expectedProfit,
      totalExpectedReturn,
      createdAt: new Date().toISOString(),
    };

    const deposits = storage.getDeposits();
    storage.saveDeposits([newDeposit, ...deposits]);

    // Create a pending transaction record
    const transactions = storage.getTransactions();
    const newTx: Transaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      userUsername: user.username,
      type: 'DEPOSIT',
      amount,
      asset,
      status: 'PENDING',
      description: `${plan.name} Pending Deposit (${asset})`,
      referenceId: newDeposit.id,
      createdAt: new Date().toISOString(),
    };
    storage.saveTransactions([newTx, ...transactions]);

    this.sendNotification(
      user.id,
      'Deposit Request Submitted',
      `Your deposit of $${amount.toLocaleString()} ${asset} for the ${plan.name} is awaiting administrative verification.`,
      'DEPOSIT'
    );

    return { success: true, deposit: newDeposit };
  }

  /**
   * Update transaction hash for pending deposit
   */
  static updateDepositTxHash(depositId: string, txHash: string): boolean {
    const deposits = storage.getDeposits();
    const dep = deposits.find(d => d.id === depositId);
    if (!dep || dep.status !== 'PENDING') return false;

    dep.txHash = txHash;
    storage.saveDeposits([...deposits]);
    return true;
  }

  /**
   * Admin approves a deposit:
   * 1. Validates deposit status (prevents double approval)
   * 2. Marks deposit as APPROVED
   * 3. Creates immutable ledger entry DEPOSIT (Credit)
   * 4. Creates Investment record (Locks principal in active contract)
   * 5. Creates immutable ledger entry INVESTMENT (Debit into contract)
   * 6. Updates user's totalDeposits
   * 7. If user has an upline, calculates referral commission, credits upline, and records REFERRAL_COMMISSION ledger entry
   * 8. Records Audit Log and Notification
   */
  static approveDeposit(
    depositId: string,
    adminUser: User,
    adminNotes?: string
  ): { success: boolean; error?: string } {
    const deposits = storage.getDeposits();
    const depIndex = deposits.findIndex(d => d.id === depositId);
    if (depIndex === -1) return { success: false, error: 'Deposit record not found' };

    const deposit = deposits[depIndex];
    if (deposit.status !== 'PENDING') {
      return { success: false, error: `Deposit is already in ${deposit.status} state.` };
    }

    const investor = storage.getUserById(deposit.userId);
    if (!investor) return { success: false, error: 'Investor account not found' };

    const plan = storage.getPlanById(deposit.planId);
    if (!plan) return { success: false, error: 'Associated investment plan not found' };

    const now = new Date();
    const maturityDate = new Date(now.getTime() + plan.durationHours * 3600 * 1000);

    // 1. Mark deposit as APPROVED
    deposit.status = 'APPROVED';
    deposit.approvedAt = now.toISOString();
    deposit.adminNotes = adminNotes || 'Approved via Admin Security Console';
    deposits[depIndex] = deposit;
    storage.saveDeposits(deposits);

    // 2. Financial Ledger: DEPOSIT Credit
    const initialBalance = investor.availableBalance;
    const postDepositBalance = initialBalance + deposit.amount;
    this.recordLedger(
      investor.id,
      'DEPOSIT',
      deposit.amount,
      'CREDIT',
      'DEPOSIT',
      deposit.id,
      initialBalance,
      postDepositBalance,
      `Deposit approved for ${plan.name} ($${deposit.amount.toLocaleString()} ${deposit.asset})`
    );

    // 3. Create active Investment record
    const newInvestment: Investment = {
      id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: investor.id,
      userUsername: investor.username,
      planId: plan.id,
      planName: plan.name,
      depositId: deposit.id,
      principalAmount: deposit.amount,
      amount: deposit.amount,
      returnPercentage: deposit.expectedReturnPercentage || plan.returnPercentage,
      expectedProfit: deposit.expectedProfit || (deposit.amount * plan.returnPercentage) / 100,
      totalExpectedReturn: deposit.totalExpectedReturn || (deposit.amount + (deposit.amount * plan.returnPercentage) / 100),
      durationHours: deposit.durationHours || plan.durationHours,
      startDate: now.toISOString(),
      maturityDate: maturityDate.toISOString(),
      status: 'ACTIVE',
      principalReturn: plan.principalReturn,
      payoutProcessed: false,
      createdAt: now.toISOString(),
    };
    const investments = storage.getInvestments();
    storage.saveInvestments([newInvestment, ...investments]);

    // 4. Financial Ledger: INVESTMENT Debit (Lock funds into investment contract)
    const postInvestmentBalance = initialBalance; // Returns to initial balance as principal is locked in active investment
    this.recordLedger(
      investor.id,
      'INVESTMENT',
      deposit.amount,
      'DEBIT',
      'INVESTMENT',
      newInvestment.id,
      postDepositBalance,
      postInvestmentBalance,
      `Principal allocated to active ${plan.name} (${plan.durationHours}h maturity)`
    );

    // 5. Update user stats
    investor.totalDeposits = (investor.totalDeposits || 0) + deposit.amount;
    storage.updateUser(investor);

    // 6. Update transaction state
    const transactions = storage.getTransactions();
    const tx = transactions.find(t => t.referenceId === deposit.id);
    if (tx) {
      tx.status = 'COMPLETED';
      tx.description = `${plan.name} Confirmed Deposit ($${deposit.amount.toLocaleString()})`;
      storage.saveTransactions([...transactions]);
    }

    // Add Investment Transaction
    const investTx: Transaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: investor.id,
      userUsername: investor.username,
      type: 'INVESTMENT',
      amount: deposit.amount,
      asset: 'USD',
      status: 'COMPLETED',
      description: `Contract Initiated: ${plan.name} (${plan.returnPercentage}% return)`,
      referenceId: newInvestment.id,
      createdAt: now.toISOString(),
    };
    storage.saveTransactions([investTx, ...storage.getTransactions()]);

    // 7. Referral Commission Execution (if upline exists)
    if (investor.uplineId) {
      const uplineUser = storage.getUserById(investor.uplineId);
      if (uplineUser && uplineUser.id !== investor.id) {
        const commissionRate = plan.referralPercentage || 5;
        const commissionAmount = (deposit.amount * commissionRate) / 100;

        if (commissionAmount > 0) {
          const uplineBeforeBalance = uplineUser.availableBalance;
          const uplineAfterBalance = uplineBeforeBalance + commissionAmount;

          uplineUser.availableBalance = uplineAfterBalance;
          uplineUser.referralEarnings = (uplineUser.referralEarnings || 0) + commissionAmount;
          storage.updateUser(uplineUser);

          // Write immutable ledger entry for referral commission
          this.recordLedger(
            uplineUser.id,
            'REFERRAL_COMMISSION',
            commissionAmount,
            'CREDIT',
            'REFERRAL',
            deposit.id,
            uplineBeforeBalance,
            uplineAfterBalance,
            `${commissionRate}% Referral commission from ${investor.fullName} ($${deposit.amount.toLocaleString()} ${plan.name})`
          );

          // Record referral transaction for upline
          const refTx: Transaction = {
            id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            userId: uplineUser.id,
            userUsername: uplineUser.username,
            type: 'REFERRAL_COMMISSION',
            amount: commissionAmount,
            asset: 'USD',
            status: 'COMPLETED',
            description: `Referral Bonus: ${commissionRate}% on ${investor.username}'s investment`,
            referenceId: deposit.id,
            createdAt: now.toISOString(),
          };
          storage.saveTransactions([refTx, ...storage.getTransactions()]);

          // Update Referral relationship stats
          const referrals = storage.getReferrals();
          const refRel = referrals.find(r => r.referrerId === uplineUser.id && r.referredUserId === investor.id);
          if (refRel) {
            refRel.totalDeposits = (refRel.totalDeposits || 0) + deposit.amount;
            refRel.commissionsEarned = (refRel.commissionsEarned || 0) + commissionAmount;
            storage.saveReferrals([...referrals]);
          }

          // Send notification to upline
          this.sendNotification(
            uplineUser.id,
            'Referral Commission Credited',
            `You received a $${commissionAmount.toFixed(2)} (${commissionRate}%) referral commission from ${investor.fullName}'s active investment.`,
            'REFERRAL'
          );
        }
      }
    }

    // 8. Notifications & Audit Logs
    this.sendNotification(
      investor.id,
      'Deposit Verified & Investment Activated',
      `Your deposit of $${deposit.amount.toLocaleString()} for the ${plan.name} has been verified and is actively earning.`,
      'INVESTMENT'
    );

    storage.addAuditLog({
      actorId: adminUser.id,
      actorUsername: adminUser.username,
      action: 'DEPOSIT_APPROVED',
      entity: 'Deposit',
      entityId: deposit.id,
      previousState: { status: 'PENDING' },
      newState: { status: 'APPROVED', amount: deposit.amount, planName: plan.name },
      notes: adminNotes || 'Admin manual verification',
    });

    return { success: true };
  }

  /**
   * Admin rejects a deposit
   */
  static rejectDeposit(
    depositId: string,
    adminUser: User,
    reason: string
  ): { success: boolean; error?: string } {
    const deposits = storage.getDeposits();
    const dep = deposits.find(d => d.id === depositId);
    if (!dep) return { success: false, error: 'Deposit not found' };
    if (dep.status !== 'PENDING') return { success: false, error: 'Deposit is not pending' };

    dep.status = 'REJECTED';
    dep.rejectedAt = new Date().toISOString();
    dep.adminNotes = reason;
    storage.saveDeposits([...deposits]);

    const transactions = storage.getTransactions();
    const tx = transactions.find(t => t.referenceId === depositId);
    if (tx) {
      tx.status = 'REJECTED';
      tx.description = `Deposit Rejected: ${reason}`;
      storage.saveTransactions([...transactions]);
    }

    this.sendNotification(
      dep.userId,
      'Deposit Verification Failed',
      `Your deposit request for $${dep.amount.toLocaleString()} was not approved. Reason: ${reason}`,
      'DEPOSIT'
    );

    storage.addAuditLog({
      actorId: adminUser.id,
      actorUsername: adminUser.username,
      action: 'DEPOSIT_REJECTED',
      entity: 'Deposit',
      entityId: dep.id,
      previousState: { status: 'PENDING' },
      newState: { status: 'REJECTED' },
      notes: reason,
    });

    return { success: true };
  }

  /**
   * User requests a withdrawal
   */
  static requestWithdrawal(
    userId: string,
    amount: number,
    asset: 'BTC' | 'ETH' | 'USDT',
    network: string,
    destinationAddress: string
  ): { success: boolean; withdrawal?: Withdrawal; error?: string } {
    const user = storage.getUserById(userId);
    if (!user) return { success: false, error: 'User not found' };

    const settings = storage.getSettings();
    const minWithdrawal = settings.minWithdrawalAmount ?? 50; // Default minimum if not set
    if (amount < minWithdrawal) {
      return { success: false, error: `Minimum withdrawal amount is $${minWithdrawal}` };
    }

    if (user.availableBalance < amount) {
      return { success: false, error: `Insufficient available balance. Your balance is $${user.availableBalance.toFixed(2)}` };
    }

    if (!destinationAddress || destinationAddress.trim().length < 10) {
      return { success: false, error: 'A valid receiving crypto wallet destination address is required.' };
    }

    // 1. Deduct from available balance (reserve funds in pending withdrawal)
    const balanceBefore = user.availableBalance;
    const balanceAfter = balanceBefore - amount;
    user.availableBalance = balanceAfter;
    storage.updateUser(user);

    // 2. Create Withdrawal record
    const newWithdrawal: Withdrawal = {
      id: `wth-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      userUsername: user.username,
      userFullName: user.fullName,
      amount,
      asset,
      network,
      destinationAddress,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    const withdrawals = storage.getWithdrawals();
    storage.saveWithdrawals([newWithdrawal, ...withdrawals]);

    // 3. Write Ledger Entry (Reserved for withdrawal)
    this.recordLedger(
      user.id,
      'WITHDRAWAL',
      amount,
      'DEBIT',
      'WITHDRAWAL',
      newWithdrawal.id,
      balanceBefore,
      balanceAfter,
      `Pending withdrawal request of $${amount.toLocaleString()} ${asset} to ${destinationAddress.slice(0, 8)}...`
    );

    // 4. Create Transaction record
    const tx: Transaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      userUsername: user.username,
      type: 'WITHDRAWAL',
      amount,
      asset,
      status: 'PENDING',
      description: `Withdrawal to ${asset} address`,
      referenceId: newWithdrawal.id,
      createdAt: new Date().toISOString(),
    };
    storage.saveTransactions([tx, ...storage.getTransactions()]);

    this.sendNotification(
      user.id,
      'Withdrawal Request Submitted',
      `Your withdrawal of $${amount.toLocaleString()} ${asset} is currently being processed by the security team.`,
      'WITHDRAWAL'
    );

    return { success: true, withdrawal: newWithdrawal };
  }

  /**
   * Admin approves/processes/completes withdrawal
   */
  static updateWithdrawalStatus(
    withdrawalId: string,
    status: 'PROCESSING' | 'COMPLETED' | 'REJECTED',
    adminUser: User,
    txHash?: string,
    adminNotes?: string
  ): { success: boolean; error?: string } {
    const withdrawals = storage.getWithdrawals();
    const wth = withdrawals.find(w => w.id === withdrawalId);
    if (!wth) return { success: false, error: 'Withdrawal not found' };

    const previousStatus = wth.status;
    const user = storage.getUserById(wth.userId);
    if (!user) return { success: false, error: 'User not found' };

    wth.status = status;
    if (txHash) wth.txHash = txHash;
    if (adminNotes) wth.adminNotes = adminNotes;

    const now = new Date().toISOString();

    if (status === 'PROCESSING') {
      wth.processedAt = now;
      this.sendNotification(
        user.id,
        'Withdrawal Processing',
        `Your withdrawal of $${wth.amount.toLocaleString()} ${wth.asset} has been queued for blockchain dispatch.`,
        'WITHDRAWAL'
      );
    } else if (status === 'COMPLETED') {
      wth.completedAt = now;
      user.totalWithdrawals = (user.totalWithdrawals || 0) + wth.amount;
      storage.updateUser(user);

      // Update transaction status
      const txs = storage.getTransactions();
      const tx = txs.find(t => t.referenceId === wth.id);
      if (tx) {
        tx.status = 'COMPLETED';
        tx.description = `Withdrawal Paid: ${wth.amount.toLocaleString()} ${wth.asset} (TX: ${txHash?.slice(0, 10) || 'Verified'}...)`;
        storage.saveTransactions([...txs]);
      }

      this.sendNotification(
        user.id,
        'Withdrawal Completed',
        `Your withdrawal of $${wth.amount.toLocaleString()} ${wth.asset} has been successfully dispatched to your wallet.`,
        'WITHDRAWAL'
      );
    } else if (status === 'REJECTED') {
      // Refund reserved funds back to user's availableBalance
      const balanceBefore = user.availableBalance;
      const balanceAfter = balanceBefore + wth.amount;
      user.availableBalance = balanceAfter;
      storage.updateUser(user);

      // Write REFUND ledger entry
      this.recordLedger(
        user.id,
        'REFUND',
        wth.amount,
        'CREDIT',
        'WITHDRAWAL',
        wth.id,
        balanceBefore,
        balanceAfter,
        `Withdrawal refund: ${adminNotes || 'Request rejected'}`
      );

      const txs = storage.getTransactions();
      const tx = txs.find(t => t.referenceId === wth.id);
      if (tx) {
        tx.status = 'REJECTED';
        tx.description = `Withdrawal Rejected: ${adminNotes || 'Declined by Admin'}`;
        storage.saveTransactions([...txs]);
      }

      this.sendNotification(
        user.id,
        'Withdrawal Rejected & Refunded',
        `Your withdrawal request of $${wth.amount.toLocaleString()} was declined. Funds have been returned to your Available Balance.`,
        'WITHDRAWAL'
      );
    }

    storage.saveWithdrawals([...withdrawals]);

    let auditAction: AuditAction = 'WITHDRAWAL_APPROVED';
    if (status === 'PROCESSING') auditAction = 'WITHDRAWAL_PROCESSING';
    if (status === 'COMPLETED') auditAction = 'WITHDRAWAL_COMPLETED';
    if (status === 'REJECTED') auditAction = 'WITHDRAWAL_REJECTED';

    storage.addAuditLog({
      actorId: adminUser.id,
      actorUsername: adminUser.username,
      action: auditAction,
      entity: 'Withdrawal',
      entityId: wth.id,
      previousState: { status: previousStatus },
      newState: { status, txHash },
      notes: adminNotes || `Status updated to ${status}`,
    });

    return { success: true };
  }

  /**
   * Settle investment on maturity:
   * 1. Marks investment as MATURED & payoutProcessed = true
   * 2. Credits expectedProfit to user's Available Balance and Earning Balance
   * 3. Credits principalAmount to Available Balance (if principalReturn is enabled)
   * 4. Writes immutable ledger entries for PROFIT and PRINCIPAL RETURN
   * 5. Sends Notification & records Transaction
   */
  static settleInvestment(investmentId: string): { success: boolean; investment?: Investment; error?: string } {
    const investments = storage.getInvestments();
    const inv = investments.find(i => i.id === investmentId);
    if (!inv) return { success: false, error: 'Investment not found' };
    if (inv.status === 'COMPLETED' || inv.payoutProcessed) {
      return { success: false, error: 'Investment is already settled' };
    }

    const user = storage.getUserById(inv.userId);
    if (!user) return { success: false, error: 'User not found' };

    inv.status = 'COMPLETED';
    inv.payoutProcessed = true;
    storage.saveInvestments([...investments]);

    let currentBalance = user.availableBalance;

    // 1. Profit Credit
    const profitBefore = currentBalance;
    const profitAfter = profitBefore + inv.expectedProfit;
    currentBalance = profitAfter;

    user.earningBalance = (user.earningBalance || 0) + inv.expectedProfit;

    this.recordLedger(
      user.id,
      'PROFIT',
      inv.expectedProfit,
      'CREDIT',
      'INVESTMENT',
      inv.id,
      profitBefore,
      profitAfter,
      `${inv.planName} Matured Profit (${inv.returnPercentage}%)`
    );

    // 2. Principal Return Credit (if applicable)
    if (inv.principalReturn && inv.principalAmount) {
      const principalBefore = currentBalance;
      const principalAfter = principalBefore + inv.principalAmount;
      currentBalance = principalAfter;

      this.recordLedger(
        user.id,
        'REFUND',
        inv.principalAmount,
        'CREDIT',
        'INVESTMENT',
        inv.id,
        principalBefore,
        principalAfter,
        `${inv.planName} Principal Capital Unlocked & Returned`
      );
    }

    user.availableBalance = currentBalance;
    storage.updateUser(user);

    // Record Transaction
    const tx: Transaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      userUsername: user.username,
      type: 'PROFIT',
      amount: inv.expectedProfit,
      asset: 'USD',
      status: 'COMPLETED',
      description: `${inv.planName} Contract Matured (+${inv.returnPercentage}%)`,
      referenceId: inv.id,
      createdAt: new Date().toISOString(),
    };
    storage.saveTransactions([tx, ...storage.getTransactions()]);

    this.sendNotification(
      user.id,
      'Investment Matured & Profits Settled',
      `Your ${inv.planName} investment has matured. $${inv.expectedProfit.toFixed(2)} profit and $${(inv.principalAmount ?? 0).toFixed(2)} principal have been credited to your Available Balance.`,
      'INVESTMENT'
    );

    return { success: true, investment: inv };
  }

  /**
   * Admin manual balance adjustment with mandatory audit logging
   */
  static adminAdjustBalance(
    userId: string,
    amount: number,
    type: 'ADD' | 'SUBTRACT',
    adminUser: User,
    reason: string
  ): { success: boolean; error?: string } {
    const user = storage.getUserById(userId);
    if (!user) return { success: false, error: 'User not found' };
    if (!reason || reason.trim().length < 5) {
      return { success: false, error: 'An auditable reason (min 5 chars) is mandatory for financial adjustments.' };
    }

    const balanceBefore = user.availableBalance;
    let balanceAfter = balanceBefore;

    if (type === 'ADD') {
      balanceAfter += amount;
      this.recordLedger(
        user.id,
        'ADJUSTMENT',
        amount,
        'CREDIT',
        'ADMIN_ADJUSTMENT',
        `adj-${Date.now()}`,
        balanceBefore,
        balanceAfter,
        `Admin Credit Adjustment: ${reason}`
      );
    } else {
      if (balanceBefore < amount) {
        return { success: false, error: `Cannot deduct $${amount} from balance of $${balanceBefore}` };
      }
      balanceAfter -= amount;
      this.recordLedger(
        user.id,
        'ADJUSTMENT',
        amount,
        'DEBIT',
        'ADMIN_ADJUSTMENT',
        `adj-${Date.now()}`,
        balanceBefore,
        balanceAfter,
        `Admin Debit Adjustment: ${reason}`
      );
    }

    user.availableBalance = balanceAfter;
    storage.updateUser(user);

    storage.addAuditLog({
      actorId: adminUser.id,
      actorUsername: adminUser.username,
      action: 'BALANCE_ADJUSTED',
      entity: 'UserBalance',
      entityId: user.id,
      previousState: { balance: balanceBefore },
      newState: { balance: balanceAfter, adjustment: amount, type },
      notes: reason,
    });

    this.sendNotification(
      user.id,
      'Account Balance Adjustment',
      `Your account balance was adjusted by ${type === 'ADD' ? '+' : '-'}$${amount.toFixed(2)}. Reason: ${reason}`,
      'SYSTEM'
    );

    return { success: true };
  }
}

export const ledgerEngine = {
  createDepositRequest: (
    arg1: any,
    planId?: string,
    amount?: number,
    asset?: 'BTC' | 'ETH' | 'USDT',
    network?: string,
    receivingAddress?: string,
    txHash?: string
  ) => {
    if (typeof arg1 === 'object') {
      const opts = arg1;
      const res = LedgerEngine.createDepositRequest(
        opts.userId,
        opts.planId,
        opts.amount,
        opts.cryptoCurrency || opts.asset || 'BTC',
        opts.network || 'Mainnet',
        opts.destinationAddress || opts.receivingAddress || '',
        opts.transactionHash || opts.txHash || ''
      );
      if (!res.success) throw new Error(res.error || 'Failed to submit deposit');
      return res.deposit!;
    }
    return LedgerEngine.createDepositRequest(arg1, planId!, amount!, asset!, network!, receivingAddress!, txHash);
  },

  submitDepositRequest: (
    arg1: any,
    planId?: string,
    amount?: number,
    asset?: 'BTC' | 'ETH' | 'USDT',
    network?: string,
    receivingAddress?: string,
    txHash?: string
  ) => {
    if (typeof arg1 === 'object') {
      const opts = arg1;
      const res = LedgerEngine.createDepositRequest(
        opts.userId,
        opts.planId,
        opts.amount,
        opts.cryptoCurrency || opts.asset || 'BTC',
        opts.network || 'Mainnet',
        opts.destinationAddress || opts.receivingAddress || '',
        opts.transactionHash || opts.txHash || ''
      );
      if (!res.success) throw new Error(res.error || 'Failed to submit deposit');
      return res.deposit!;
    }
    return LedgerEngine.createDepositRequest(arg1, planId!, amount!, asset!, network!, receivingAddress!, txHash);
  },

  updateDepositTxHash: (depositId: string, txHash: string) =>
    LedgerEngine.updateDepositTxHash(depositId, txHash),

  approveDeposit: (depositId: string, adminUserOrId: User | string, adminNotes?: string) => {
    const adminUser: User = typeof adminUserOrId === 'string'
      ? storage.getUserById(adminUserOrId) || {
          id: adminUserOrId,
          username: 'admin',
          fullName: 'System Administrator',
          email: 'admin@capitalfargo.com',
          role: 'ADMIN',
          status: 'ACTIVE',
          btcWallet: '',
          ethWallet: '',
          usdtWallet: '',
          uplineId: null,
          availableBalance: 0,
          earningBalance: 0,
          totalDeposits: 0,
          totalWithdrawals: 0,
          referralEarnings: 0,
          createdAt: '',
          updatedAt: ''
        }
      : adminUserOrId;
    return LedgerEngine.approveDeposit(depositId, adminUser, adminNotes);
  },

  rejectDeposit: (depositId: string, adminUserOrId: User | string, reason?: string) => {
    const adminUser: User = typeof adminUserOrId === 'string'
      ? storage.getUserById(adminUserOrId) || {
          id: adminUserOrId,
          username: 'admin',
          fullName: 'System Administrator',
          email: 'admin@capitalfargo.com',
          role: 'ADMIN',
          status: 'ACTIVE',
          btcWallet: '',
          ethWallet: '',
          usdtWallet: '',
          uplineId: null,
          availableBalance: 0,
          earningBalance: 0,
          totalDeposits: 0,
          totalWithdrawals: 0,
          referralEarnings: 0,
          createdAt: '',
          updatedAt: ''
        }
      : adminUserOrId;
    return LedgerEngine.rejectDeposit(depositId, adminUser, reason || 'Rejected by Admin');
  },

  createWithdrawalRequest: (
    arg1: any,
    amount?: number,
    asset?: 'BTC' | 'ETH' | 'USDT',
    network?: string,
    destinationAddress?: string
  ) => {
    if (typeof arg1 === 'object') {
      const opts = arg1;
      const res = LedgerEngine.requestWithdrawal(
        opts.userId,
        opts.amount,
        opts.cryptoCurrency || opts.asset || 'BTC',
        opts.network || 'Mainnet',
        opts.destinationAddress
      );
      if (!res.success) throw new Error(res.error || 'Failed to submit withdrawal');
      return res.withdrawal!;
    }
    return LedgerEngine.requestWithdrawal(arg1, amount!, asset!, network!, destinationAddress!);
  },

  submitWithdrawalRequest: (
    arg1: any,
    amount?: number,
    asset?: 'BTC' | 'ETH' | 'USDT',
    network?: string,
    destinationAddress?: string
  ) => {
    if (typeof arg1 === 'object') {
      const opts = arg1;
      const res = LedgerEngine.requestWithdrawal(
        opts.userId,
        opts.amount,
        opts.cryptoCurrency || opts.asset || 'BTC',
        opts.network || 'Mainnet',
        opts.destinationAddress
      );
      if (!res.success) throw new Error(res.error || 'Failed to submit withdrawal');
      return res.withdrawal!;
    }
    return LedgerEngine.requestWithdrawal(arg1, amount!, asset!, network!, destinationAddress!);
  },

  approveWithdrawal: (withdrawalId: string, adminUserOrId: User | string, txHash?: string, notes?: string) => {
    const adminUser: User = typeof adminUserOrId === 'string'
      ? storage.getUserById(adminUserOrId) || {
          id: adminUserOrId,
          username: 'admin',
          fullName: 'System Administrator',
          email: 'admin@capitalfargo.com',
          role: 'ADMIN',
          status: 'ACTIVE',
          btcWallet: '',
          ethWallet: '',
          usdtWallet: '',
          uplineId: null,
          availableBalance: 0,
          earningBalance: 0,
          totalDeposits: 0,
          totalWithdrawals: 0,
          referralEarnings: 0,
          createdAt: '',
          updatedAt: ''
        }
      : adminUserOrId;
    return LedgerEngine.updateWithdrawalStatus(withdrawalId, 'COMPLETED', adminUser, txHash || `0x${Date.now()}dispatched`, notes);
  },

  rejectWithdrawal: (withdrawalId: string, adminUserOrId: User | string, reason?: string) => {
    const adminUser: User = typeof adminUserOrId === 'string'
      ? storage.getUserById(adminUserOrId) || {
          id: adminUserOrId,
          username: 'admin',
          fullName: 'System Administrator',
          email: 'admin@capitalfargo.com',
          role: 'ADMIN',
          status: 'ACTIVE',
          btcWallet: '',
          ethWallet: '',
          usdtWallet: '',
          uplineId: null,
          availableBalance: 0,
          earningBalance: 0,
          totalDeposits: 0,
          totalWithdrawals: 0,
          referralEarnings: 0,
          createdAt: '',
          updatedAt: ''
        }
      : adminUserOrId;
    return LedgerEngine.updateWithdrawalStatus(withdrawalId, 'REJECTED', adminUser, undefined, reason || 'Rejected by administrator');
  },

  settleInvestmentMaturity: (investmentId: string) =>
    LedgerEngine.settleInvestment(investmentId),

  settleInvestment: (investmentId: string) =>
    LedgerEngine.settleInvestment(investmentId),

  processMaturedInvestments: () => {
    const active = storage.getInvestments().filter(i => i.status === 'ACTIVE');
    const now = new Date();
    let settled = 0;
    active.forEach(inv => {
      if (new Date(inv.maturityDate) <= now) {
        LedgerEngine.settleInvestment(inv.id);
        settled++;
      }
    });
    return settled;
  },

  adjustUserBalance: (
    arg1: any,
    amount?: number,
    type?: 'ADD' | 'SUBTRACT',
    adminUserOrId?: User | string,
    reason?: string
  ): { success: boolean; error?: string } => {
    if (typeof arg1 === 'object') {
      const opts = arg1;
      const targetUserId = opts.targetUserId || opts.userId;
      const adjustType: 'ADD' | 'SUBTRACT' = opts.operation === 'DEBIT' || opts.type === 'SUBTRACT' ? 'SUBTRACT' : 'ADD';
      const adjustAmount = Number(opts.amount) || 0;
      const adminUser: User = typeof opts.adminId === 'string'
        ? storage.getUserById(opts.adminId) || {
            id: opts.adminId,
            username: 'admin',
            fullName: 'System Administrator',
            email: 'admin@capitalfargo.com',
            role: 'ADMIN',
            status: 'ACTIVE',
            btcWallet: '',
            ethWallet: '',
            usdtWallet: '',
            uplineId: null,
            availableBalance: 0,
            earningBalance: 0,
            totalDeposits: 0,
            totalWithdrawals: 0,
            referralEarnings: 0,
            createdAt: '',
            updatedAt: ''
          }
        : opts.adminUser || {
            id: 'admin-01',
            username: 'admin',
            fullName: 'System Administrator',
            email: 'admin@capitalfargo.com',
            role: 'ADMIN',
            status: 'ACTIVE',
            btcWallet: '',
            ethWallet: '',
            usdtWallet: '',
            uplineId: null,
            availableBalance: 0,
            earningBalance: 0,
            totalDeposits: 0,
            totalWithdrawals: 0,
            referralEarnings: 0,
            createdAt: '',
            updatedAt: ''
          };
      const res = LedgerEngine.adminAdjustBalance(targetUserId, adjustAmount, adjustType, adminUser, opts.reason || 'Admin Adjustment');
      if (!res.success) throw new Error(res.error || 'Adjustment failed');
      return { success: true };
    }
    const adminUser: User = typeof adminUserOrId === 'string'
      ? storage.getUserById(adminUserOrId) || {
          id: adminUserOrId,
          username: 'admin',
          fullName: 'System Administrator',
          email: 'admin@capitalfargo.com',
          role: 'ADMIN',
          status: 'ACTIVE',
          btcWallet: '',
          ethWallet: '',
          usdtWallet: '',
          uplineId: null,
          availableBalance: 0,
          earningBalance: 0,
          totalDeposits: 0,
          totalWithdrawals: 0,
          referralEarnings: 0,
          createdAt: '',
          updatedAt: ''
        }
      : adminUserOrId!;
    return LedgerEngine.adminAdjustBalance(arg1, amount!, type!, adminUser, reason!);
  },

  adminAdjustBalance: (
    userId: string,
    amount: number,
    type: 'ADD' | 'SUBTRACT',
    adminUser: User,
    reason: string
  ) => LedgerEngine.adminAdjustBalance(userId, amount, type, adminUser, reason),
};

