package net.mcornell.moviemogul.repo;

import org.springframework.data.repository.CrudRepository;

import net.mcornell.moviemogul.domain.Actor;

public interface ActorRepository extends CrudRepository<Actor, Long> {

}
