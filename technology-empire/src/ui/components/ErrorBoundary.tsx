import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props { children: ReactNode; resetKey?: string }
interface State { error: Error | null }

/** Catches render errors in a screen and shows a readable card instead of a white page. */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error): State { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Ekran hatası', error, info.componentStack); }
  componentDidUpdate(prev: Props) { if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null }); }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="page">
        <section className="card err-card">
          <header className="card-h"><h3>Bu ekranda bir hata oluştu</h3></header>
          <div className="card-b col">
            <p>Oyununuz bozulmadı; yalnızca bu ekran çizilemedi. Başka bir ekrana geçip geri dönmeyi deneyin.</p>
            <pre className="err">{this.state.error.message}</pre>
            <div className="btn-row"><button className="primary" onClick={() => this.setState({ error: null })}>Yeniden dene</button></div>
          </div>
        </section>
      </div>
    );
  }
}
