import CrudPage from '../components/CrudPage';
import { LOCATION_REQ_CONFIG } from '../data/entities';

export default function LocationsPage() {
  return <CrudPage config={LOCATION_REQ_CONFIG} />;
}
