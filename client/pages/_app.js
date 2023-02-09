import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/header';

const AppComponent = (props) => {
  const { Component, pageProps, currentUser } = props;
  return (
    <div>
      <Header currentUser={currentUser} />
      <div className="container">
        <Component {...pageProps} currentUser={currentUser} />
      </div>
    </div>
  );
};

AppComponent.getInitialProps = async ({ Component, ctx }) => {
  try {
    const { data } = await buildClient(ctx).get('/api/users/currentuser');
    let pageProps = {};
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(
        ctx,
        buildClient(ctx),
        data.currentUser
      );
    }
    return {
      pageProps,
      ...data,
    };
  } catch (e) {
    console.log(e);
    return {};
  }
};

export default AppComponent;
