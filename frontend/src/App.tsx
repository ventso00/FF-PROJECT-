import { Route, Switch } from 'wouter';
import { Header, Footer } from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import EventsPage from '@/pages/EventsPage';
import EventDetailPage from '@/pages/EventDetailPage';
import TeamsPage from '@/pages/TeamsPage';
import TeamDetailPage from '@/pages/TeamDetailPage';
import CreatorsPage from '@/pages/CreatorsPage';
import CreatorDetailPage from '@/pages/CreatorDetailPage';
import ProposeEventPage from '@/pages/ProposeEventPage';
import NewsPage from '@/pages/NewsPage';
import AdminPage from '@/pages/AdminPage';
import PrivacyPage from '@/pages/PrivacyPage';
import NotFoundPage from '@/pages/NotFoundPage';

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-ash-950 text-ash-100">
      <Header />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/evenements" component={EventsPage} />
          <Route path="/evenements/:slug" component={EventDetailPage} />
          <Route path="/equipes" component={TeamsPage} />
          <Route path="/equipes/:slug" component={TeamDetailPage} />
          <Route path="/createurs" component={CreatorsPage} />
          <Route path="/createurs/:slug" component={CreatorDetailPage} />
          <Route path="/proposer" component={ProposeEventPage} />
          <Route path="/actualites" component={NewsPage} />
          <Route path="/admin" component={AdminPage} />
          <Route path="/confidentialite" component={PrivacyPage} />
          <Route component={NotFoundPage} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

export default App;
