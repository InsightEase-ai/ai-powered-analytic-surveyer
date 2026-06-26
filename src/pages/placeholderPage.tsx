import DashboardLayout from "../componet/dashboardLayout";

type PlaceholderPageProps = {
  title: string;
};

function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="mt-2 text-gray-600">This page is coming soon.</p>
    </DashboardLayout>
  );
}

export default PlaceholderPage;
