import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Welcome to Pickmeup
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Order delicious food for pickup. Browse our menu, place your order,
          and pick it up at your convenience.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/menu">
            <Button size="lg">View Menu</Button>
          </Link>
        </div>
      </div>

      <div className="mt-16 grid md:grid-cols-3 gap-8">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <div className="text-4xl mb-4">🍔</div>
          <h2 className="text-xl font-semibold mb-2">Browse Menu</h2>
          <p className="text-gray-600">
            Explore our delicious selection of burgers, sandwiches, sides, and
            more.
          </p>
        </div>
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <div className="text-4xl mb-4">🛒</div>
          <h2 className="text-xl font-semibold mb-2">Add to Cart</h2>
          <p className="text-gray-600">
            Select your favorite items and customize your order.
          </p>
        </div>
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <div className="text-4xl mb-4">⏰</div>
          <h2 className="text-xl font-semibold mb-2">Pick Up</h2>
          <p className="text-gray-600">
            Choose your pickup time and collect your order when ready.
          </p>
        </div>
      </div>
    </div>
  );
}

