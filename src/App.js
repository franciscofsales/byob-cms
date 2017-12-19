import 'babel-polyfill/dist/polyfill';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import StateHOF, { setAccessToken } from './StateHOF';
import { BrowserRouter, Route } from 'react-router-dom';
import CreateOrReadOne from './AppLib/CreateOrReadOne';
import ReadMany from './AppLib/ReadMany';
import Update from './AppLib/Update';
import IndexRoute from './AppLib/IndexRoute';
import NavBar from './AppLib/NavBar';
import CodeLogin from './AppLib/LoginLib/CodeLogin';
import withOptionItems from './AppLib/formLib/withOptionItems';
import { ToastContainer } from 'react-toastify';

class App extends Component {
  componentDidMount() {
    document.title = this.props.config.title || 'CMS'
  }
  render() {
    const { config } = this.props
    const resourceRouteElements = config
      .resources
      .reduce((acc, resource) => {
        const { uniqKey } = resource
        const {
          create,
          readMany,
          readOne,
          update,
        } = resource.crudMapping

        if (readMany) {
          const path = `/${resource.name}`
          acc.push(<Route
            key={path}
            exact
            path={path}
            render={(props) => <ReadMany resource={resource} config={config} {...props}/>}
          />);
        }
        if (create || readOne) {
          const path = `/${resource.name}/:${uniqKey}`
          acc.push(<Route
            key={path}
            exact
            path={path}
            render={(props) => <CreateOrReadOne resource={resource} config={config} {...props}/>}
          />);
        }
        if (update) {
          const path = `/${resource.name}/:${uniqKey}/edit`
          acc.push(<Route
            key={path}
            exact
            path={path}
            render={(props) => <Update resource={resource} config={config} {...props}/>}
          />);
        }
        return acc;
      }, [])

    return (
      <div>
        <BrowserRouter>
          <div>
            <ToastContainer
              position="top-center"
              type="default"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              pauseOnHover
            />
            <NavBar config={config}/>
            <div className="container-fluid">
              <IndexRoute config={config}/>
              {resourceRouteElements}
            </div>
          </div>
        </BrowserRouter>
      </div>
    );
  }
}

function DefaultLogin () {
  return <div>
    <h1>You need to provide a React Component to the "Login" option</h1>
  </div>
}

function AppWithGuard (props) {
  const { config } = props
  const Login = config.Login || DefaultLogin

  const ComponentWithGuard = (props) => {
    if (props.accessToken) {
      return <App {...props}/>
    } else {
      return Login
        ? <Login setAccessToken={props.setAccessToken}/>
        : null
    }
  }

  const ComponentWithState = connect(
    (state) => ({ accessToken: state.accessToken }),
    { setAccessToken }
  )(ComponentWithGuard)

  return <ComponentWithState {...props}/>
}

export default StateHOF(AppWithGuard);
export {
  CodeLogin,
  withOptionItems,
}
