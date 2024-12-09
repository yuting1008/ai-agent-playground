import React from 'react';
import './ProductList.scss';

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
}

export interface ProductListProps {
  products: Product[];
}

const ProductList: React.FC<ProductListProps> = (props) => {
  const { products } = props;

  return (
    <div className="product-list">
      <h2>商品列表</h2>
      <ul>
        {products.map((product: Product) => (
          <li key={product.id}>
            <div className="product-item">
              <div className="product-image">
                <img src={product.image} alt={product.name} />
              </div>

              <div className="product-details">
                <h3>{product.name}</h3>
                <p>价格：{product.price} 元</p>
                <p>{product.description}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductList;
