import * as React from 'react';
import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';
// import createCache from '@emotion/cache';
// import createEmotionServer from '@emotion/server/create-instance';
const { NEXT_PUBLIC_SEGMENT_WRITE_KEY, NODE_ENV = 'development' } = process.env;
import * as snippet from '@segment/snippet';
// import { AppType } from 'next/app';

// function createEmotionCache() {
//   return createCache({ key: 'css' });
// }

export default class MyDocument extends Document {
  renderSegmentSnippet() {
    const opts = {
      apiKey: NEXT_PUBLIC_SEGMENT_WRITE_KEY,
      page: false,
    };

    if (NODE_ENV === 'development') {
      return snippet.max(opts);
    }

    return snippet.min(opts);
  }

  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="en" translate="no">
        <Head>
          <meta charSet="utf-8" />
          <link rel="apple-touch-icon" sizes="180x180" href="/favicon/cometa.svg" />
          <link rel="icon" type="image/svg" sizes="32x32" href="/favicon/cometa.svg" />
          <link rel="icon" type="image/svg" sizes="16x16" href="/favicon/cometa.svg" />
          <meta name="theme-color" content="#FB63AC" />
          <meta name="msapplication-TileColor" content="#FB63AC" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <link rel="manifest" href="/manifest.json" />

          <meta name="description" content="Dashboard Cometa" />
          <meta name="keywords" content="react,material,kit,application,dashboard,admin,template" />
          <meta name="author" content="GET COMETA" />
          <script dangerouslySetInnerHTML={{ __html: this.renderSegmentSnippet() }} />
        </Head>

        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

// ----------------------------------------------------------------------

// MyDocument.getInitialProps = async (ctx: DocumentContext) => {
//   const originalRenderPage = ctx.renderPage;

//   // You can consider sharing the same Emotion cache between all the SSR requests to speed up performance.
//   // However, be aware that it can have global side effects.
//   const cache = createEmotionCache();
//   const { extractCriticalToChunks } = createEmotionServer(cache);

//   // We're passing `emotionCache` to App component
//   ctx.renderPage = () =>
//     originalRenderPage({
//       enhanceApp: (App: React.ComponentType<React.ComponentProps<AppType> & {emotionCache:any}>) =>
//         function EnhanceApp(props) {
//           return <App emotionCache={cache} {...props} />;
//         },
//     });

//   const initialProps = await Document.getInitialProps(ctx);
//   // This is important. It prevents Emotion to render invalid HTML.
//   // See https://github.com/mui/material-ui/issues/26561#issuecomment-855286153
//   const emotionStyles = extractCriticalToChunks(initialProps.html);
//   const emotionStyleTags = emotionStyles.styles.map((style) => (
//     <style
//       data-emotion={`${style.key} ${style.ids.join(' ')}`}
//       key={style.key}
//       // eslint-disable-next-line react/no-danger
//       dangerouslySetInnerHTML={{ __html: style.css }}
//     />
//   ));

//   return {
//     ...initialProps,
//     // return emotionStyleTags as props
//     emotionStyleTags,
//   };
// };
