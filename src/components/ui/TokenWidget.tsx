import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { Icons } from './icons';

export function TokenWidget() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <Link to="/tokens" className="token-widget" style={{ textDecoration: 'none' }}>
      <Icons.balance className="token-widget__icon" size={16} />
      <span className="token-widget__amount">{user.tokens_balance}</span>
    </Link>
  );
}
