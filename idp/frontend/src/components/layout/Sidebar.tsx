import Link from "next/link";

export default function Sidebar() {
  const navigation = [
    { name: "Dashboard", href: "/", current: true },
    { name: "Websites", href: "/websites", current: false },
    { name: "Jobs", href: "/jobs", current: false },
    { name: "Settings", href: "/settings", current: false },
  ];

  return (
    <div className="w-64 bg-white shadow-sm h-full">
      <nav className="mt-5 px-2">
        <div className="space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex items-center px-2 py-2 text-sm font-medium rounded-md
                ${
                  item.current
                    ? "bg-primary-100 text-primary-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }
              `}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
