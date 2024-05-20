import Document, { Html, Head, Main, NextScript, DocumentContext, DocumentInitialProps } from 'next/document';
import * as snippet from '@segment/snippet';

const { NEXT_PUBLIC_SEGMENT_WRITE_KEY, NODE_ENV = 'development' } = process.env;

class MyDocument extends Document {
  renderSnippet() {
    const opts = {
      apiKey: NEXT_PUBLIC_SEGMENT_WRITE_KEY,
      page: false,
    };

    if (NODE_ENV === 'development') {
      return snippet.max(opts);
    }

    return snippet.min(opts);
  }

  static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="es" translate="no">
        <Head>
          <script dangerouslySetInnerHTML={{ __html: this.renderSnippet() }} />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Poppins:wght@250;275;300;400;500;600;700;800;900&display=swap"
            rel="stylesheet"
          />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=1.0.1" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=1.0.1" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=1.0.1" />
          <link rel="manifest" href="/site.webmanifest?v=1.0.1" />
          <link rel="mask-icon" href="/safari-pinned-tab.svg?v=1.0.1" color="#4a5cff" />
          <link rel="shortcut icon" href="/favicon.ico?v=1.0.1" />
          <meta name="apple-mobile-web-app-title" content="Cometa" />
          <meta name="application-name" content="Cometa" />
          <meta name="msapplication-TileColor" content="#ffffff" />
          <meta name="theme-color" content="#ffffff" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
