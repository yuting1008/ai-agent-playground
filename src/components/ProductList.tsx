import React from 'react';
import { useContexts } from '../providers/AppProvider';

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

  const { isNightMode } = useContexts();

  const styles = {
    ul: {
      listStyleType: 'none',
      padding: 0,
    } as React.CSSProperties,
    li: {
      border: '1px solid #ddd',
      padding: '5px 20px',
      marginBottom: '8px',
    } as React.CSSProperties,
    productItem: {
      display: 'flex',
      alignItems: 'center',
      margin: '0px',
    } as React.CSSProperties,
    productImage: {
      width: '150px !important',
      height: 'auto',
      objectFit: 'cover',
    } as React.CSSProperties,
    productDetails: {
      flex: 1,
      marginLeft: '20px',
    } as React.CSSProperties,
  };

  return (
    <div className="product-list">
      <h2>商品列表</h2>
      <ul style={styles.ul}>
        {products.map((product: Product) => (
          <li style={styles.li} key={product.id}>
            <div style={styles.productItem}>
              <div style={styles.productImage}>
                <img src={product.image} alt={product.name} />
              </div>

              <div style={styles.productDetails}>
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
