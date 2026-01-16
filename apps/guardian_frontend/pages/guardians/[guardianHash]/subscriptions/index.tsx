import { useStudentStore, useSubscriptionSelection } from '@cometa/hooks';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import { getSession, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import CheckoutFooter, { CheckoutFooterButton, ContainerInfo, LabelItemsCount } from '~/components/CheckoutFooter';
import { InformationDrawer } from '~/components/Drawer.Variants';
import Navbar from '~/components/Navbar';
import { PageHeader } from '~/components/PageHeader';
import { SubscriptionCardActive, SubscriptionCardAvailable } from '~/components/SubscriptionCard.Variants';
import * as Tabs from '~/components/Tabs';
import { useUTMRouter as useRouter } from '~/components/UtmNavigation';
import { PageViewedCategory, TrackEvents } from '~/constants/events';
import { useSendEvent, useSendPageEvent } from '~/hooks/useSendEvent';
import { cn } from '~/lib/cn';
import { useDrawerStore } from '~/stores/drawerStore';
import { useSelectedSchool } from '~/stores/globalStore';
import { api } from '~/utils/api';
import { getDependentColor } from '~/utils/colors';
import redirectByGuardianFraudStatus from '~/utils/redirectByGuardianFraudStatus';

const SubscriptionPage = () => {
  const router = useRouter();
  const session = useSession();
  const user = session.data?.user;
  const selectedSchool = useSelectedSchool();
  const { hideDrawer, show, title, description, intent } = useDrawerStore();
  const { setStudentIds } = useStudentStore();
  const [isLoading, setIsLoading] = useState(false);
  const sendPageEvent = useSendPageEvent();
  const sendEvent = useSendEvent();

  useEffect(() => {
    sendPageEvent(TrackEvents.subscriptions.pageViewed, PageViewedCategory);
  }, []);

  const selectedTab = router.query.selectedTab ?? 'active';
  const [tabValue, setTabValue] = useState(selectedTab as string);

  const { data: subscribables } = api.subscriptions.getSubscribables.useQuery({
    schoolId: selectedSchool?.id ?? '',
  });

  const { data: subscriptions } = api.subscriptions.getActives.useQuery({
    schoolId: selectedSchool?.id ?? '',
  });

  const { isDisabled, handleItemSelect, resetSelection, selectedItems } = useSubscriptionSelection();

  const goToSummary = () => {
    sendEvent(TrackEvents.subscriptions.checkoutOpened);
    setIsLoading(true);
    router.push({
      pathname: '/guardians/[guardianHash]/subscriptions/summary',
      query: { ...router.query },
    });
  };

  const onClickInfo = (studentId: string) => {
    resetSelection();
    setStudentIds([studentId]);
  };

  return (
    <>
      <PageHeader title="Domiciliaciones" />
      <div
        className={cn('pb-6', {
          'pb-36': !!selectedItems.length,
        })}
      >
        <Tabs.Tabs
          className="w-full border-b-[#E3E0FF] border-b border-solid border-t-0 border-x-0"
          value={tabValue}
          onValueChange={(value) => {
            const event =
              value === 'active'
                ? TrackEvents.subscriptions.tabs.activeClicked
                : TrackEvents.subscriptions.tabs.availableClicked;

            sendEvent(event);
            setTabValue(value);
            router.push({ query: { ...router.query, selectedTab: value } }, undefined, { shallow: true });
          }}
        >
          <Tabs.TabsTrigger className="flex-col w-full py-6 xl:text-sm lg:flex-row" value="active">
            Activas
          </Tabs.TabsTrigger>
          <Tabs.TabsTrigger className="flex-col w-full py-6 xl:text-sm lg:flex-row" value="available">
            Disponibles
          </Tabs.TabsTrigger>
          <Tabs.TabsContent
            value="active"
            className="px-5 md:px-0 relative flex flex-col space-y-4 items-center data-[state='active']:pb-6 lg:mt-9 data-[state='inactive']:m-0 lg:data-[state='active']:min-h-[calc(100vh_-_250px)]"
          >
            {subscriptions?.length ? (
              <>
                <h3 className="text-[#57537A] font-light mb-8">
                  Aquí visualizarás tus domiciliaciones activas actualmente.
                </h3>
                <section className="w-full mb-8 space-y-4">
                  {subscriptions.map((subscription) => {
                    const studentColor = getDependentColor(user?.dependents, subscription.student.id);
                    return (
                      <SubscriptionCardActive
                        key={subscription.id}
                        onClickInfo={() => {
                          sendEvent(TrackEvents.subscriptions.activeSubscription.clicked);
                          onClickInfo(subscription.student.id);
                        }}
                        href={{
                          pathname: '/guardians/[guardianHash]/subscriptions/[id]',
                          query: {
                            ...router.query,
                            id: subscription.id,
                            school: selectedSchool?.id,
                          },
                        }}
                        student={{
                          name: subscription.student.full_name.toUpperCase(),
                          background: studentColor.background,
                          textColor: studentColor.text,
                        }}
                        concept={subscription.concept}
                        payDate={subscription.next_payment_date}
                      />
                    );
                  })}
                </section>
              </>
            ) : (
              <section className="flex flex-col items-center justify-center h-[calc(100vh_-_20rem)]">
                <h4 className="text-[#57537A] font-light text-center">Todavía no tienes domiciliaciones activas.</h4>
              </section>
            )}
          </Tabs.TabsContent>
          <Tabs.TabsContent
            value="available"
            className="px-5 md:px-0 relative flex flex-col space-y-4 items-center data-[state='active']:pb-6 lg:mt-9 data-[state='inactive']:m-0 lg:data-[state='active']:min-h-[calc(100vh_-_250px)]"
          >
            {subscribables?.length ? (
              <>
                <h3 className="text-[#57537A] font-light mb-8">
                  Seleccione los conceptos a los que desees domiciliarte.
                </h3>
                <section className="space-y-4">
                  {subscribables?.map((subscribable) => {
                    const studentColor = getDependentColor(user?.dependents, subscribable.student_id);

                    return (
                      <SubscriptionCardAvailable
                        key={`${subscribable.concept_id}_${subscribable.student_id}`}
                        hrefToPay={{
                          pathname: '/guardians/[guardianHash]/',
                          query: { guardianHash: router.query.guardianHash },
                        }}
                        onChange={() => {
                          const selected = selectedItems.some(
                            (item) =>
                              item.concept_id === subscribable.concept_id && item.student_id === subscribable.student_id
                          );

                          const event = selected
                            ? TrackEvents.subscriptions.subscription.deselected
                            : TrackEvents.subscriptions.subscription.selected;

                          sendEvent(event);

                          handleItemSelect(subscribable);
                        }}
                        selected={selectedItems.some(
                          (item) =>
                            item.concept_id === subscribable.concept_id && item.student_id === subscribable.student_id
                        )}
                        student={{
                          name: subscribable.student_name.toUpperCase(),
                          background: studentColor.background,
                          textColor: studentColor.text,
                        }}
                        hasDueOrder={subscribable.has_due_order}
                        conceptName={subscribable.concept_name}
                        price={subscribable.concept_price}
                        nextDue={subscribable.next_due}
                        disabled={isDisabled(subscribable)}
                      />
                    );
                  })}
                </section>
              </>
            ) : (
              <section className="flex flex-col items-center justify-center h-[calc(100vh_-_20rem)]">
                <h4 className="text-[#57537A] font-light text-center">No tienes domiciliaciones disponibles.</h4>
              </section>
            )}
          </Tabs.TabsContent>
        </Tabs.Tabs>
        <CheckoutFooter open={!!selectedItems.length}>
          <ContainerInfo>
            <LabelItemsCount count={selectedItems.length}>SELECCIONADAS</LabelItemsCount>
          </ContainerInfo>
          <CheckoutFooterButton onClick={goToSummary} loading={isLoading}>
            Continuar
          </CheckoutFooterButton>
        </CheckoutFooter>
        <InformationDrawer open={show} intent={intent} title={title} description={description} onClick={hideDrawer} />
      </div>
    </>
  );
};

SubscriptionPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <>
      <Head>
        <title>Domiciliaciones</title>
      </Head>
      <div className="sticky top-0 z-20">
        <Navbar />
      </div>
      <div className="max-w-md mx-auto">{page}</div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const { guardianHash } = context.query;
  const redirect = redirectByGuardianFraudStatus(session, guardianHash as string, context.query);
  if (redirect) return redirect;
  return {
    props: {},
  };
};
SubscriptionPage.auth = true;
export default SubscriptionPage;
