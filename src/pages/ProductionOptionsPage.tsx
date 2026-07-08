import CrudPage from '../components/CrudPage';
import { PRODUCTION_OPTION_CONFIG } from '../data/entities';

export default function ProductionOptionsPage() {
  return <CrudPage config={PRODUCTION_OPTION_CONFIG} />;
}
