export default function CardGrid({ data }) {
  return (
    <div className="grid gap-8 md:grid-cols-3 px-6 md:px-16 mt-10">
      {data.map((item, i) => (
        <div
          key={i}
          className="bg-background rounded-xl shadow transition hover:shadow-soft hover:scale-[1.02] border border-secondary-light"
        >
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-40 object-cover rounded-t-xl"
          />
          <div className="p-4">
            <h3 className="font-semibold text-lg text-primary">{item.title}</h3>
            <p className="text-text-secondary text-sm mt-1">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
