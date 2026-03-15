import Link from "next/link";
import { Loader2 } from "lucide-react";

interface CardProps {
  href: string;
  title: string;
  value: string;
  subtitle: string;
  loading?: boolean;
}

export default function Card({ href, title, value, subtitle, loading }: CardProps) {
  return (
    <Link href={href} className="block">
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
        
        {loading ? (
          <div className="flex items-center justify-center h-16">
            <Loader2 className="animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            <p className="text-3xl font-bold text-blue-600 mb-2">{value}</p>
            <p className="text-sm text-gray-500">{subtitle}</p>
          </>
        )}
      </div>
    </Link>
  );
}