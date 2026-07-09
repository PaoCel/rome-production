import CrudPage from '../components/CrudPage';
import { INVOICE_CONFIG } from '../data/entities';

export default function InvoicesPage() {
  return <CrudPage config={INVOICE_CONFIG} />;
}
