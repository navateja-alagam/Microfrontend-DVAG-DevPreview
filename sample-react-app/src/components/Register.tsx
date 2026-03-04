import { useEffect, useState, useRef } from 'react';
import bridge from '@lightning-out/bridge';

interface RegisterProps {
  productNameInput?: string;
  productIdInput?: string;
}

function Register({ productNameInput = '', productIdInput = '' }: RegisterProps) {
  const [model, setModel] = useState<any>({});
  const [dataOnLoad, setDataOnLoad] = useState<any>({});
  const [savedSnapshot, setSavedSnapshot] = useState<string>(JSON.stringify({}));
  const [submitted, setSubmitted] = useState(false);
  const [productName, setProductName] = useState(productNameInput);
  const beforeUnloadHandlerRef = useRef<((e: BeforeUnloadEvent) => void) | null>(null);
  const dataHandlerRef = useRef<((e: any) => void) | null>(null);

  // Ref to always hold the latest model value (avoids stale closure issues)
  const modelRef = useRef(model);

  // Keep modelRef in sync with model state
  useEffect(() => {
    modelRef.current = model;
  }, [model]);

  useEffect(() => {
    try {
      const data = bridge.getData?.() || {};
      applyIncomingData(data);
      setDataOnLoad(data);
      const handler = (e: any) => applyIncomingData(e?.detail || {});
      dataHandlerRef.current = handler;
      (bridge as any).addEventListener?.('data', handler);

    } catch { }

    return () => {
      try {
        if (dataHandlerRef.current) {
          (bridge as any).removeEventListener?.('data', dataHandlerRef.current);
        }
      } catch { }
    };
  }, []);

  useEffect(() => {
    if (productNameInput) {
      setProductName(productNameInput);
    }
  }, [productNameInput]);

  useEffect(() => {
    if (productIdInput) {
      setModel((prev: any) => ({ ...prev, productId: productIdInput }));
    }
  }, [productIdInput]);

  // @ts-expect-error - Unused function kept for potential future use
  const hasUnsavedChanges = () => {
    return JSON.stringify(model) !== savedSnapshot;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSnapshot(JSON.stringify(model));
    setSubmitted(true);
    bridge.isConnected() && bridge.dispatchEvent(new CustomEvent('mfe:dirty-state-reset'));
    toggleBeforeUnload(false);
  };

  const reset = () => {
    setModel({});
    bridge.isConnected() && bridge.dispatchEvent(new CustomEvent('mfe:dirty-state-reset'));
    setSavedSnapshot(JSON.stringify({}));
    toggleBeforeUnload(false);
  };

  const onChange = (field: string, value: any) => {
    const updated = { ...model, [field]: value };
    setModel(updated);

    // Side effects must be outside the state updater (React StrictMode double-invokes updater functions)
    const dirty = JSON.stringify(updated) !== savedSnapshot;
    if (dirty) {
      bridge.isConnected() && bridge.dispatchEvent(new CustomEvent('mfe:dirty-state-detected'));
    } else {
      bridge.isConnected() && bridge.dispatchEvent(new CustomEvent('mfe:dirty-state-reset'));
    }
    toggleBeforeUnload(dirty);
  };

  const toggleBeforeUnload = (enable: boolean) => {
    if (enable) {
      if (!beforeUnloadHandlerRef.current) {
        const handler = (e: BeforeUnloadEvent) => {
          e.preventDefault();
          e.returnValue = '';
          return '' as any;
        };
        beforeUnloadHandlerRef.current = handler;
        window.addEventListener('beforeunload', handler);
      }
    } else if (beforeUnloadHandlerRef.current) {
      window.removeEventListener('beforeunload', beforeUnloadHandlerRef.current);
      beforeUnloadHandlerRef.current = null;
    }
  };

  const applyIncomingData = (payload: any) => {
    if (payload && typeof payload === 'object') {
      if (payload.productName && payload.productName !== productName) {
        setProductName(payload.productName);
      }
      if (payload.productId && payload.productId !== model.productId) {
        setModel((prev: any) => ({ ...prev, productId: payload.productId }));
      }
      if (!payload.productName && !payload.productId && Object.keys(payload).length > 0) {
        setModel({ ...payload });
      }
    }
  };

  if (submitted) {
    return (
      <div className="card">
        <h2>Registration submitted</h2>
        <p>Thank you{model?.name ? `, ${model.name}` : ''}. We have received your registration.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Micro Frontend React- Product Registration</h2>
      <label htmlFor="productName">Product</label>
      <input id="productName" name="productName" value={productName} disabled />

      <label htmlFor="productId">Product ID</label>
      <input id="productId" name="productId" value={model.productId || productIdInput} disabled />

      <form onSubmit={submit}>
        <label htmlFor="name">Full Name</label>
        <input
          id="name"
          name="name"
          value={model.name || ''}
          onChange={(e) => onChange('name', e.target.value)}
          required
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={model.email || ''}
          onChange={(e) => onChange('email', e.target.value)}
          required
        />

        <label htmlFor="serial">Bike Serial Number</label>
        <input
          id="serial"
          name="serial"
          value={model.serial || ''}
          onChange={(e) => onChange('serial', e.target.value)}
          required
        />

        <label htmlFor="purchaseDate">Purchase Date</label>
        <input
          id="purchaseDate"
          name="purchaseDate"
          type="date"
          value={model.purchaseDate || ''}
          onChange={(e) => onChange('purchaseDate', e.target.value)}
        />

        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          value={model.notes || ''}
          onChange={(e) => onChange('notes', e.target.value)}
        />

        <div className="actions" style={{ marginTop: '16px' }}>
          <button className="primary" type="submit">
            Submit
          </button>
          <button className="secondary" type="button" onClick={reset}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default Register;
