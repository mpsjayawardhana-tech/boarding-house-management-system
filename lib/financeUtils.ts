import { User, P2PDebt, Payment } from '@/store';

/**
 * Calculates net balances for the current user against all other users.
 * Returns a record where the key is the other user's ID, and the value is the net balance.
 * A positive value means the other user owes the current user.
 * A negative value means the current user owes the other user.
 */
export function calculateNetBalances(
  users: User[],
  currentUserId: string,
  p2pDebts: P2PDebt[],
  payments: Payment[]
): Record<string, number> {
  const balances: Record<string, number> = {};
  
  users.filter(u => u.id !== currentUserId).forEach(otherUser => {
    const amountTheyOweYou = p2pDebts
      .filter(debt => debt.payerId === currentUserId && debt.borrowerId === otherUser.id)
      .reduce((sum, debt) => sum + Number(debt.amount), 0);

    const amountYouOweThem = p2pDebts
      .filter(debt => debt.payerId === otherUser.id && debt.borrowerId === currentUserId)
      .reduce((sum, debt) => sum + Number(debt.amount), 0);

    const paymentsIReceived = payments
      .filter(p => p.payeeId === currentUserId && p.payerId === otherUser.id)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const paymentsIMade = payments
      .filter(p => p.payerId === currentUserId && p.payeeId === otherUser.id)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    balances[otherUser.id] = (amountTheyOweYou - amountYouOweThem) - (paymentsIReceived - paymentsIMade);
  });

  return balances;
}
