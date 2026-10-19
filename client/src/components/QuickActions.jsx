import React from 'react';
import { PlusCircle, MinusCircle } from 'lucide-react';

export default function QuickActions({ onOpenAddModal, onCredit, onDebit }) {
  const handleCredit = onCredit || (() => onOpenAddModal && onOpenAddModal('credit'));
  const handleDebit = onDebit || (() => onOpenAddModal && onOpenAddModal('debit'));

  return (
    <div className="quick-action-bar">
      <button 
        id="btn-quick-credit"
        className="btn-quick-action credit"
        onClick={handleCredit}
      >
        <PlusCircle size={18} />
        <span>+ Money In</span>
      </button>

      <button 
        id="btn-quick-debit"
        className="btn-quick-action debit"
        onClick={handleDebit}
      >
        <MinusCircle size={18} />
        <span>- Spend Out</span>
      </button>
    </div>
  );
}
