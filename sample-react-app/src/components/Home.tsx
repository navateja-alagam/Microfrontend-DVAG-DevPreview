import { useState } from 'react';
import Register from './Register';
import DealerLocator from './DealerLocator';

function Home() {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedProductName, setSelectedProductName] = useState<string>('');
  const [showRegister, setShowRegister] = useState(false);

  const onSelectProduct = (productId: string, productName: string) => {
    setSelectedProductId(productId);
    setSelectedProductName(productName);
    setShowRegister(!!productId);
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Welcome to the React Microfrontend</h2>
        <p>
          This is a sample React app that demonstrates Micro-Frontend integration
          with Salesforce via the <code>@lightning-out/bridge</code>.
        </p>
      </div>

      {showRegister && (
        <div className="card" style={{ marginTop: '16px' }}>
          <h3>Product Registration</h3>
          <Register
            productNameInput={selectedProductName}
            productIdInput={selectedProductId}
          />
        </div>
      )}

      <div className="card" style={{ marginTop: '16px' }}>
        <h3>Dealer Locator</h3>
        <DealerLocator />
      </div>
    </div>
  );
}

export default Home;
