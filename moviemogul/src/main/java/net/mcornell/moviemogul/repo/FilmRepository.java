package net.mcornell.moviemogul.repo;

import org.springframework.data.repository.CrudRepository;

import net.mcornell.moviemogul.domain.Film;

public interface FilmRepository extends CrudRepository<Film, Long> {

}
