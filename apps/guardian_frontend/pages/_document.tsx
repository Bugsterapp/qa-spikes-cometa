import Document, { type DocumentContext, type DocumentInitialProps, Head, Html, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="es" translate="no">
        <Head>
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

          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        </Head>
        <body className="antialiased">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
