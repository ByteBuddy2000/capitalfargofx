import React, { useState } from 'react';
import { 
  Headphones, 
  Mail, 
  Send, 
  MessageSquare, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  ExternalLink 
} from 'lucide-react';
import { User, SupportTicket } from '../../types';
import { storage } from '../../lib/storage';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';

interface SupportViewProps {
  currentUser: User;
}

export const SupportView: React.FC<SupportViewProps> = ({ currentUser }) => {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Deposits & Blockchain Verification');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { success } = useToast();
  const settings = storage.getPlatformSettings();
  const tickets = (storage.getSupportTickets() || []).filter(t => t && currentUser && t.userId === currentUser.id);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      const newTicket: SupportTicket = {
        id: `ticket-${Date.now()}`,
        userId: currentUser?.id || 'guest',
        userFullName: currentUser?.fullName || 'Investor',
        userEmail: currentUser?.email || 'investor@example.com',
        subject: subject.trim(),
        category,
        priority,
        message: message.trim(),
        status: 'OPEN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const allTickets = storage.getSupportTickets() || [];
      storage.saveSupportTickets([newTicket, ...allTickets]);

      storage.addAuditLog({
        actorId: currentUser.id,
        actorUsername: currentUser.username,
        action: 'SUPPORT_TICKET_CREATED',
        entity: 'SupportTicket',
        entityId: newTicket.id,
        notes: `Ticket created: ${subject}`,
      });

      setSubject('');
      setMessage('');
      success('Ticket Submitted', 'Our institutional investor support desk will review your inquiry promptly.');
    }, 450);
  };

  return (
    <div className="space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Headphones className="w-6 h-6 text-teal-600" />
            Investor Support Desk
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            24/7 dedicated support for deposits, contract questions, and compliance verifications.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Direct Channels & Create Ticket */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Create Support Inquiry</h3>
              <p className="text-xs text-slate-500">Submit a prioritized inquiry directly to the operations desk</p>
            </div>

            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <Input
                label="Subject / Topic"
                placeholder="e.g. Inquiring regarding Bitcoin deposit confirmation"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option>Deposits & Blockchain Verification</option>
                    <option>Withdrawals & Payout Liquidity</option>
                    <option>Investment Plan Inquiries</option>
                    <option>Referral & Commission Tracking</option>
                    <option>Security & Wallet Updates</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="LOW">Low - General Inquiries</option>
                    <option value="MEDIUM">Medium - Standard Request</option>
                    <option value="HIGH">High - Urgent Transaction Assistance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Message Details
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide detailed information regarding your inquiry, including relevant transaction IDs or wallet addresses..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full justify-center bg-teal-600 hover:bg-teal-700 font-bold shadow-md shadow-teal-600/20"
              >
                Submit Inquiry
              </Button>
            </form>
          </div>

        </div>

        {/* Right Column: Direct Channels & Ticket History */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Direct Channels */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-sm space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400 block">
              Official Communication Channels
            </span>

            <div className="space-y-3 text-xs">
              <a
                href={`mailto:${settings.supportEmail}`}
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/80 border border-slate-700 hover:bg-slate-800 transition-colors"
              >
                <Mail className="w-5 h-5 text-teal-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Email Support</span>
                  <span className="font-bold text-white text-xs">{settings.supportEmail}</span>
                </div>
              </a>

              <a
                href={settings.telegramChannel}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/80 border border-slate-700 hover:bg-slate-800 transition-colors"
              >
                <Send className="w-5 h-5 text-blue-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Telegram VIP Channel</span>
                  <span className="font-bold text-white text-xs">Join Broadcast Community</span>
                </div>
              </a>
            </div>
          </div>

          {/* Ticket History */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Your Support Inquiries ({tickets.length})</h3>

            {tickets.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No active support tickets.</p>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto">
                {tickets.map(t => (
                  <div key={t.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 truncate max-w-[180px]">{t.subject}</span>
                      <Badge variant={t.status === 'RESOLVED' ? 'success' : t.status === 'IN_PROGRESS' ? 'warning' : 'neutral'}>
                        {t.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{t.message}</p>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
