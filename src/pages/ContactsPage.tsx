import CrudPage from '../components/CrudPage';
import { CONTACT_CONFIG } from '../data/entities';

export default function ContactsPage() {
  return <CrudPage config={CONTACT_CONFIG} />;
}
