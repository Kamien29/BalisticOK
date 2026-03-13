import { Reveal } from '../common/Reveal';
import { Accordion } from '../common/Accordion';

export function FAQSection({ items }) {
  return (
    <section id="faq" className="section">
      <Reveal className="section-header">
        <h2>FAQ</h2>
        <p>Najczęstsze pytania o projekt i dołączanie do zespołu.</p>
      </Reveal>
      <Reveal>
        <Accordion items={items} />
      </Reveal>
    </section>
  );
}

