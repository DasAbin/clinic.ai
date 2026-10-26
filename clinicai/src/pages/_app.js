import "@/styles/globals.css";
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  weight: ['200', '300', '400', '700', '900'],
  variable: '--font-inter',
});

export default function App({ Component, pageProps }) {
  return (
    <main className={`${inter.variable} font-sans`}>
      <div role="note" style={{ background: "#fff4cf", color: "#332500", padding: "10px 18px", fontSize: "14px", lineHeight: "1.4", borderBottom: "1px solid #d5b653" }}>Seminar prototype. Synthetic data only. Not for diagnosis, prescribing, or real patient records. AI output can omit medication frequency and must be reviewed.</div>
      <Component {...pageProps} />
    </main>
  );
}
