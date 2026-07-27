import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Studio } from '@/components/Studio';

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 flex-col">
        <Studio />
      </main>
      <Footer />
    </div>
  );
}

export default App;
