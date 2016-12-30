package net.mcornell.moviemogul.domain;

import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

import lombok.Data;

@Data
@Entity
public class Actor {

	private @Id @GeneratedValue Long id;

	private String name;
	@Enumerated(EnumType.STRING)
	private Gender gender;
	private Byte data0;
	private Byte data1;
	private Byte data2;
	private Byte data3;
	private Byte data4;
	private Byte data5;
	private Byte data6;

	private Actor() {
	}

	public Actor(String name, Gender gender, Byte data0, Byte data1, Byte data2, Byte data3, Byte data4, Byte data5,
			Byte data6) {
		this.name = name;
		this.gender = gender;
		this.data0 = data0;
		this.data1 = data1;
		this.data2 = data2;
		this.data3 = data3;
		this.data4 = data4;
		this.data5 = data5;
		this.data6 = data6;

	}
}
