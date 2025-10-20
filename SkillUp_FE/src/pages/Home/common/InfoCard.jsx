export default function InfoCard({ icon, title, desc }) {
  return (
    <div className="p-6 bg-background rounded-2xl shadow-soft hover:shadow-lg transition-all border border-secondary-light">
      <div className="text-primary text-3xl mb-4 flex justify-center">{icon}</div>
      <h3 className="font-semibold text-lg text-primary-dark mb-2">{title}</h3>
      <p className="text-text-secondary text-sm">{desc}</p>
    </div>
  );
}
