import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Edit2
} from 'lucide-react';
import { User, InvestmentPlan } from '../../types';
import { storage } from '../../lib/storage';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/Toast';

interface AdminPlansProps {
  currentUser: User;
}

export const AdminPlans: React.FC<AdminPlansProps> = ({ currentUser }) => {
  const [plans, setPlans] = useState<InvestmentPlan[]>(storage.getPlans());
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<InvestmentPlan | null>(null);

  const { success } = useToast();

  const handleOpenEdit = (plan: InvestmentPlan) => {
    setEditingPlan({ ...plan });
    setEditModalOpen(true);
  };

  const handleOpenCreate = () => {
    const newPlan: InvestmentPlan = {
      id: `plan-${Date.now()}`,
      name: 'Diamond VIP Tier',
      slug: 'diamond-tier',
      description: 'Exclusive institutional high-frequency liquidity cycle for VIP portfolios.',
      returnPercentage: 75,
      durationHours: 48,
      minimumAmount: 25000,
      maximumAmount: 100000,
      referralCommissionRate: 5,
      principalReturn: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingPlan(newPlan);
    setEditModalOpen(true);
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    const currentPlans = storage.getPlans();
    const exists = currentPlans.some(p => p.id === editingPlan.id);
    let updatedList: InvestmentPlan[];

    if (exists) {
      updatedList = currentPlans.map(p => p.id === editingPlan.id ? { ...editingPlan, updatedAt: new Date().toISOString() } : p);
    } else {
      updatedList = [...currentPlans, editingPlan];
    }

    storage.savePlans(updatedList);
    setPlans(updatedList);

    storage.addAuditLog({
      actorId: currentUser.id,
      actorUsername: currentUser.username,
      action: 'PLAN_CONFIG_UPDATED',
      entity: 'InvestmentPlan',
      entityId: editingPlan.id,
      newState: editingPlan,
      notes: `Admin saved plan parameters for ${editingPlan.name}`,
    });

    success('Plan Configuration Saved', `${editingPlan.name} is now updated.`);
    setEditModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-blue-400" />
            Structured Investment Plans
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure ROI yield multipliers, lock durations, minimum/maximum thresholds, and contract rules.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenCreate}
          leftIcon={<Plus className="w-4 h-4" />}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
        >
          Create New Plan Tier
        </Button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(plan => (
          <div
            key={plan.id}
            className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-black text-white">{plan.name}</h3>
                <Badge variant={plan.isActive ? 'success' : 'neutral'}>
                  {plan.isActive ? 'ACTIVE' : 'INACTIVE'}
                </Badge>
              </div>

              <div className="text-3xl font-black text-emerald-400 font-mono mb-2">
                +{plan.returnPercentage}% ROI
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                {plan.description}
              </p>

              <div className="space-y-2 p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-mono mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-400">Lock Duration:</span>
                  <span className="font-bold text-white">{plan.durationHours} Hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Min Investment:</span>
                  <span className="font-bold text-emerald-400">${(plan?.minimumAmount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Max Investment:</span>
                  <span className="font-bold text-slate-300">
                    {(plan?.maximumAmount || 0) > 0 ? `$${(plan?.maximumAmount || 0).toLocaleString()}` : 'Unlimited'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Referral Commission:</span>
                  <span className="font-bold text-purple-400">{plan.referralCommissionRate}%</span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => handleOpenEdit(plan)}
              leftIcon={<Edit2 className="w-4 h-4" />}
              className="w-full justify-center bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 font-bold"
            >
              Edit Plan Parameters
            </Button>
          </div>
        ))}
      </div>

      {/* Edit Plan Modal */}
      {editingPlan && (
        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title={`Edit ${editingPlan.name}`}
          description="Update yield percentages, duration parameters, and limits for this plan."
          maxWidth="lg"
        >
          <form onSubmit={handleSavePlan} className="space-y-4">
            <Input
              label="Plan Name"
              value={editingPlan.name}
              onChange={e => setEditingPlan({ ...editingPlan, name: e.target.value })}
              required
            />

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Plan Description
              </label>
              <textarea
                rows={2}
                value={editingPlan.description}
                onChange={e => setEditingPlan({ ...editingPlan, description: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Return Percentage (%)"
                type="number"
                min={1}
                max={500}
                value={editingPlan.returnPercentage}
                onChange={e => setEditingPlan({ ...editingPlan, returnPercentage: Number(e.target.value) })}
                required
              />

              <Input
                label="Duration (Hours)"
                type="number"
                min={1}
                max={720}
                value={editingPlan.durationHours}
                onChange={e => setEditingPlan({ ...editingPlan, durationHours: Number(e.target.value) })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Minimum Amount ($)"
                type="number"
                min={10}
                value={editingPlan.minimumAmount}
                onChange={e => setEditingPlan({ ...editingPlan, minimumAmount: Number(e.target.value) })}
                required
              />

              <Input
                label="Maximum Amount ($ - 0 for Unlimited)"
                type="number"
                min={0}
                value={editingPlan.maximumAmount}
                onChange={e => setEditingPlan({ ...editingPlan, maximumAmount: Number(e.target.value) })}
                required
              />
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingPlan.isActive}
                  onChange={e => setEditingPlan({ ...editingPlan, isActive: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Plan Is Active & Visible</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingPlan.principalReturn}
                  onChange={e => setEditingPlan({ ...editingPlan, principalReturn: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Principal Capital Returned at Maturity</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="bg-blue-600 hover:bg-blue-700 font-bold"
              >
                Save Plan Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
