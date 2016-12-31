package net.mcornell.moviemogul.domain;

import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

import lombok.AllArgsConstructor;
import lombok.Data;

@Entity
@Data
@AllArgsConstructor
public class Role {

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

	private Role() {
	}
}
