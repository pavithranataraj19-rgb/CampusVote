package com.campusvote.backend.vote;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VoteRepository extends JpaRepository<Vote, Long> {

    boolean existsByUserIdAndPollId(Long userId, Long pollId);

    Optional<Vote> findByUserIdAndPollId(
            Long userId,
            Long pollId
    );

    long countByPollId(Long pollId);

    long countByOptionId(Long optionId);

    List<Vote> findByPollId(Long pollId);

    void deleteByPollId(Long pollId);
}