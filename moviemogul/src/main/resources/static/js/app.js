'use strict';

// tag::vars[]
const React = require('react');
const ReactDOM = require('react-dom')
const client = require('./client');
// end::vars[]

// tag::app[]
class App extends React.Component {

	constructor(props) {
		super(props);
		this.state = {films: [], actors: []};
	}

	componentDidMount() {
		client({method: 'GET', path: '/api/films'}).done(response => {
			this.setState({films: response.entity._embedded.films});
		});
	}
	


	render() {
		return (
			<FilmList films={this.state.films} />
		)
	}

}
// end::app[]

// tag::film-list[]
class FilmList extends React.Component{
	render() {
		var films = this.props.films.map(film =>
			<Film key={film._links.self.href} film={film}/>
		);

		return (
			<table>
				<tbody>
					<tr>
						<th>Name</th>
						<th>Description</th>
					</tr>
					{films}
				</tbody>
			</table>
		)
	}
}
// end::film-list[]

// tag::film[]
class Film extends React.Component{
	render() {
		return (
			<tr>
				<td>{this.props.film.name}</td>
				<td>{this.props.film.description}</td>
			</tr>
		)
	}
}
// end::film[]

// tag::render[]
ReactDOM.render(
	<App />,
	document.getElementById('react')
)
// end::render[]

