package net.mcornell.moviemogul.domain;

import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

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

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Gender getGender() {
		return gender;
	}

	public void setGender(Gender gender) {
		this.gender = gender;
	}

	public Byte getData0() {
		return data0;
	}

	public void setData0(Byte data0) {
		this.data0 = data0;
	}

	public Byte getData1() {
		return data1;
	}

	public void setData1(Byte data1) {
		this.data1 = data1;
	}

	public Byte getData2() {
		return data2;
	}

	public void setData2(Byte data2) {
		this.data2 = data2;
	}

	public Byte getData3() {
		return data3;
	}

	public void setData3(Byte data3) {
		this.data3 = data3;
	}

	public Byte getData4() {
		return data4;
	}

	public void setData4(Byte data4) {
		this.data4 = data4;
	}

	public Byte getData5() {
		return data5;
	}

	public void setData5(Byte data5) {
		this.data5 = data5;
	}

	public Byte getData6() {
		return data6;
	}

	public void setData6(Byte data6) {
		this.data6 = data6;
	}

}
