import { Link } from 'react-router-dom';
import { PageHead } from '../components/ui';

export default function NotFound() {
  return (
    <>
      <PageHead title="Page introuvable">Cette page n'existe pas ou a été déplacée.</PageHead>
      <Link className="btn" to="/">Retour à l'accueil</Link>
    </>
  );
}
