// `https://api.frankfurter.app/latest?amount=100&from=EUR&to=USD`

import { useState } from "react";
import { useEffect } from "react";

export default function Converter() {
  const [input, setInput] = useState(10);
  const [output, setOutput] = useState("");
  const [fromCurrency, setFromCurrency] = useState("EUR");
  const [toCurrency, setToCurrency] = useState("USD");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(
    function () {
      if (fromCurrency === toCurrency) return setOutput(input);
      async function convert() {
        setIsLoading(true);
        if (fromCurrency === toCurrency) return;
        const res = await fetch(
          `https://api.frankfurter.app/latest?amount=${input}&from=${fromCurrency}&to=${toCurrency}`
        );
        const data = await res.json();
        setOutput(data.rates[toCurrency]);
        setIsLoading(false);
      }
      convert();
    },
    [input, fromCurrency, toCurrency]
  );

  return (
    <div>
      <input
        type="number"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        // disabled={isLoading}
      />
      <select
        value={fromCurrency}
        onChange={(e) => setFromCurrency(e.target.value)}
        disabled={isLoading}
      >
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
        <option value="CAD">CAD</option>
        <option value="INR">INR</option>
      </select>
      <select
        value={toCurrency}
        onChange={(e) => setToCurrency(e.target.value)}
        disabled={isLoading}
      >
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
        <option value="CAD">CAD</option>
        <option value="INR">INR</option>
      </select>

      {/* <Currency fromCurrency={fromCurrency} setFromCurrency={setFromCurrency} />
      <Currency toCurrency={toCurrency} setToCurrency={setToCurrency} /> */}
      {isLoading ? (
        <Loader />
      ) : (
        <p>
          <strong>
            {output} {toCurrency}
          </strong>
        </p>
      )}
    </div>
  );
}
function Loader() {
  return <p>Loading...</p>;
}
