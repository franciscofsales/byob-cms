import 'babel-polyfill/dist/polyfill';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import StateHOF, { setAccessToken } from './StateHOF';
import { BrowserRouter, Route } from 'react-router-dom';
import Login from './AppLib/Login'
import CreateOrReadOne from './AppLib/CreateOrReadOne';
import ReadMany from './AppLib/ReadMany';
import Update from './AppLib/Update';
import IndexRoute from './AppLib/IndexRoute';
import NavBar from './AppLib/NavBar';

class App extends Component {
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
        <NavBar/>
        <BrowserRouter>
          <div className="container-fluid">
            <IndexRoute config={config}/>
            {resourceRouteElements}
          </div>
        </BrowserRouter>
      </div>
    );
  }
}

function AppWithGuard (props) {
  const { config } = props
  // TODO if LoginComponent is a string, we return the component for that type
  const GuardComponent = config.Login || Login

  const ComponentWithGuard = (props) => {
    if (props.accessToken) {
      return <App {...props}/>
    } else {
      return GuardComponent
        ? <GuardComponent setAccessToken={props.setAccessToken}/>
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
