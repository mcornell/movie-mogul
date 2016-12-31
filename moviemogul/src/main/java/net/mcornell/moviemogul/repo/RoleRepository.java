package net.mcornell.moviemogul.repo;

import org.springframework.data.repository.CrudRepository;

import net.mcornell.moviemogul.domain.Role;

public interface RoleRepository extends CrudRepository<Role, Long> {

}
