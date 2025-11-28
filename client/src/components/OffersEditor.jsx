// src/components/OffersEditor.jsx
import React from "react";

const OfferRow = ({ idx, offer, onChange, onRemove }) => {
  return (
    <div className="flex gap-2 items-start">
      <input
        type="text"
        placeholder="Title (e.g. Wifi)"
        value={offer.title}
        onChange={(e) => onChange(idx, { ...offer, title: e.target.value })}
        className="border rounded px-2 py-1 text-sm flex-1"
      />
      <input
        type="text"
        placeholder="Subtitle (optional)"
        value={offer.subtitle}
        onChange={(e) => onChange(idx, { ...offer, subtitle: e.target.value })}
        className="border rounded px-2 py-1 text-sm flex-1"
      />
      <input
        type="text"
        placeholder="iconKey (optional)"
        value={offer.iconKey}
        onChange={(e) => onChange(idx, { ...offer, iconKey: e.target.value })}
        className="border rounded px-2 py-1 text-sm w-36"
      />
      <button type="button" onClick={() => onRemove(idx)} className="text-xs px-2 py-1 bg-rose-100 text-rose-600 rounded">Remove</button>
    </div>
  );
};

export default function OffersEditor({ value = [], onChange }) {
  const add = () => onChange([ ...value, { title: "", subtitle: "", iconKey: "" } ]);
  const update = (i, v) => {
    const copy = [...value]; copy[i] = v; onChange(copy);
  };
  const remove = (i) => { const copy = [...value]; copy.splice(i,1); onChange(copy); };

  return (
    <div>
      <div className="space-y-2">
        {value.length === 0 && <div className="text-sm text-slate-500">No entries yet. Add some features the place offers.</div>}
        {value.map((offer, idx) => <OfferRow key={idx} idx={idx} offer={offer} onChange={update} onRemove={remove} />)}
      </div>

      <div className="mt-2">
        <button type="button" onClick={add} className="px-3 py-1 bg-emerald-500 text-white rounded text-sm">Add offering</button>
      </div>

      <div className="mt-2 text-xs text-slate-400">
        Tip: use the iconKey that matches your `facilityIcons` keys (e.g. "wifi", "parking"); leave blank to use default icon.
      </div>
    </div>
  );
}
