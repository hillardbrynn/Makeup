// app/shop/product/[id]/page.js
import ProductDetail from './ProductDetails';

// Since we're using JavaScript, there are no TypeScript constraints
export default function Page({ params }) {
  return <ProductDetail id={params.id} />;
}