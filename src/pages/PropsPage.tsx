import CrudPage from '../components/CrudPage';
import { PROP_ITEM_CONFIG } from '../data/entities';

export default function PropsPage() {
  return <CrudPage config={PROP_ITEM_CONFIG} />;
}
