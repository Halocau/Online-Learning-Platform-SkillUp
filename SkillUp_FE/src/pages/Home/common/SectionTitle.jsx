export default function SectionTitle({ title, subtitle }) {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold text-primary mb-2">{title}</h2>
      {subtitle && <p className="text-text-secondary">{subtitle}</p>}
    </div>
  );
}
