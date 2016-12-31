package net.mcornell.moviemogul.domain;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.OneToOne;

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
	@OneToOne
	private Role roleOne;
	@OneToOne
	private Role roleTwo;
	@OneToOne
	private Role roleThree;

	private Film() {
	}

	// public Film(String name, Short budgetMinimum, Short budgetIdeal, String
	// description, Role roleOne, Role roleTwo, Role roleThree) {
	// this.name = name;
	// this.budgetMinimum = budgetMinimum;
	// this.budgetIdeal = budgetIdeal;
	// this.description = description;
	// this.roleOne = roleOne;
	// this.roleTwo = roleTwo;
	// this.roleThree = roleThree;
	//
	// }

}
