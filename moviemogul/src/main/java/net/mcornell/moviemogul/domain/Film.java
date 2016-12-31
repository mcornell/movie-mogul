package net.mcornell.moviemogul.domain;

import java.util.Set;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.OneToMany;

import lombok.AllArgsConstructor;
import lombok.Data;

@Entity
@Data
@AllArgsConstructor
public class Film {

	private @Id @GeneratedValue Long id;

	private String name;
	private Short budgetMinimum;
	private Short budgetIdeal;
	private String description;

	// Changing to a Set of Roles
	@OneToMany
	@JoinTable(name = "FILM_ROLES", joinColumns = @JoinColumn(name = "FILM_ID", referencedColumnName = "ID"), inverseJoinColumns = @JoinColumn(name = "ROLE_ID", referencedColumnName = "ID"))
	private Set<Role> roles;
	// @OneToOne
	// private Role roleOne;
	// @OneToOne
	// private Role roleTwo;
	// @OneToOne
	// private Role roleThree;

	private Film() {
	}

}
