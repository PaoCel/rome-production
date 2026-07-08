import CrudPage from '../components/CrudPage';
import { CAST_ROLE_CONFIG } from '../data/entities';

export default function CastingPage() {
  return <CrudPage config={CAST_ROLE_CONFIG} />;
}
