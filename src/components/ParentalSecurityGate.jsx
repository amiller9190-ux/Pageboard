import { useState } from 'react';

const CORRECT_ANSWER = 56;

export default function ParentalSecurityGate({ onGatePass }) {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (parseInt(answer, 10) === CORRECT_ANSWER) {
      setError(false);
      onGatePass();
    } else {
      setError(true);
      setAnswer('');
    }
  };

  return (
    <div className="fixed inset-0 bg-brand-obsidian/95 flex items-center justify-center z-[9999]">
      <div className="bg-brand-charcoal border-2 border-brand-gold rounded-xl p-8 max-w-[400px] w-[90%] text-center">
        {/* Title */}
        <h2 className="text-brand-gold text-lg font-bold mb-3 tracking-wide">
          🔒 ADULT VERIFICATION REQUIRED
        </h2>

        <p className="text-gray-500 text-sm leading-relaxed mb-5">
          To access database management settings or data export portals, please
          complete this math challenge:
        </p>

        {/* Equation */}
        <div className="text-2xl font-bold text-white my-5 tracking-wider">
          7 × 8 = ?
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <input
            type="number"
            placeholder="Type your answer..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full p-3 bg-[#1F2833] border border-[#242F3D] text-white rounded-md text-lg text-center outline-none focus:border-brand-gold transition-colors duration-200 mb-4"
            required
            autoFocus
          />
          <button
            type="submit"
            className="w-full bg-brand-gold text-brand-obsidian py-3 px-5 rounded-md font-bold hover:bg-brand-gold-dim transition-colors duration-200"
          >
            UNLOCK ADMINISTRATIVE SYSTEM
          </button>
        </form>

        {error && (
          <div className="text-red-400 text-sm mt-3 font-semibold">
            Incorrect calculation security mismatch. Please calculate carefully.
          </div>
        )}
      </div>
    </div>
  );
}
