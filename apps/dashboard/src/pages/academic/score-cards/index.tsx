import Layout from '/src/components/layouts';
import { ScoreCardList } from '/src/components/academic/score-cards/score-card-list';
import { ReactNode } from 'react';

ScoreCardsPage.getLayout = function getLayout(page: ReactNode) {
  return (
    <Layout dashboardVariant="stretch" title="Boletas">
      {page}
    </Layout>
  );
};

function ScoreCardsPage() {
  return <ScoreCardList />;
}

ScoreCardsPage.auth = true;

export default ScoreCardsPage;
