import CrudPage from '../components/CrudPage';
import { LOCATION_CONFIG } from '../data/entities';

export default function LocationsPage() {
  return <CrudPage config={LOCATION_CONFIG} />;
}
