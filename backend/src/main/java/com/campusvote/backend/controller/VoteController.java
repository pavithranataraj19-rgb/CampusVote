package com.campusvote.backend.controller;

import com.campusvote.backend.entity.User;
import com.campusvote.backend.poll.Poll;
import com.campusvote.backend.poll.PollOption;
import com.campusvote.backend.poll.PollOptionRepository;
import com.campusvote.backend.poll.PollRepository;
import com.campusvote.backend.repository.UserRepository;
import com.campusvote.backend.vote.Vote;
import com.campusvote.backend.vote.VoteRepository;
import com.campusvote.backend.vote.VoteRequest;
import com.campusvote.backend.vote.VoteResult;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/votes")
@CrossOrigin(origins = "*")
public class VoteController {

    private final VoteRepository voteRepository;
    private final UserRepository userRepository;
    private final PollRepository pollRepository;
    private final PollOptionRepository pollOptionRepository;

    public VoteController(
            VoteRepository voteRepository,
            UserRepository userRepository,
            PollRepository pollRepository,
            PollOptionRepository pollOptionRepository) {

        this.voteRepository = voteRepository;
        this.userRepository = userRepository;
        this.pollRepository = pollRepository;
        this.pollOptionRepository = pollOptionRepository;
    }

    // =========================
    // SUBMIT VOTE
    // =========================

    @PostMapping
    public ResponseEntity<?> submitVote(@RequestBody VoteRequest request) {

        try {

            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() ->
                            new RuntimeException("User not found"));

            Poll poll = pollRepository.findById(request.getPollId())
                    .orElseThrow(() ->
                            new RuntimeException("Poll not found"));

            boolean alreadyVoted =
                    voteRepository.existsByUserIdAndPollId(
                            request.getUserId(),
                            request.getPollId()
                    );

            if (alreadyVoted) {
                return ResponseEntity.badRequest()
                        .body("You have already voted in this poll.");
            }

            if (!poll.isActive()) {
                return ResponseEntity.badRequest()
                        .body("This poll is currently closed.");
            }

            if (poll.getStartDate() != null &&
                    LocalDateTime.now().isBefore(poll.getStartDate())) {

                return ResponseEntity.badRequest()
                        .body("This poll has not started yet.");
            }

            if (poll.getEndDate() != null &&
                    LocalDateTime.now().isAfter(poll.getEndDate())) {

                return ResponseEntity.badRequest()
                        .body("This poll has ended.");
            }

            PollOption option =
                    pollOptionRepository.findById(request.getOptionId())
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Poll option not found"
                                    ));

            if (option.getPoll() == null ||
                    !option.getPoll().getId()
                            .equals(poll.getId())) {

                return ResponseEntity.badRequest()
                        .body("Invalid option for this poll.");
            }

            Vote vote = new Vote();

            vote.setUser(user);
            vote.setPoll(poll);
            vote.setOption(option);
            vote.setVotedAt(LocalDateTime.now());

            voteRepository.save(vote);

            return ResponseEntity.ok(
                    "Vote submitted successfully."
            );

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================
    // CHECK WHETHER USER VOTED
    // =========================

    @GetMapping("/check/{userId}/{pollId}")
    public ResponseEntity<Boolean> checkVote(
            @PathVariable Long userId,
            @PathVariable Long pollId) {

        boolean hasVoted =
                voteRepository.existsByUserIdAndPollId(
                        userId,
                        pollId
                );

        return ResponseEntity.ok(hasVoted);
    }


    // =========================
    // GET USER'S SELECTED OPTION
    // =========================

    @GetMapping("/user/{userId}/poll/{pollId}")
    public ResponseEntity<?> getUserVote(
            @PathVariable Long userId,
            @PathVariable Long pollId) {

        try {

            Optional<Vote> vote =
                    voteRepository.findByUserIdAndPollId(
                            userId,
                            pollId
                    );

            if (vote.isEmpty()) {
                return ResponseEntity.ok(null);
            }

            return ResponseEntity.ok(
                    vote.get().getOption().getId()
            );

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================
    // AGGREGATE POLL RESULTS
    // =========================

    @GetMapping("/results/{pollId}")
    public ResponseEntity<?> getResults(
            @PathVariable Long pollId) {

        try {

            pollRepository.findById(pollId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Poll not found"
                            ));

            List<PollOption> options =
                    pollOptionRepository.findByPollId(pollId);

            long totalVotes =
                    voteRepository.countByPollId(pollId);

            List<VoteResult> results =
                    options.stream()
                            .map(option -> {

                                long voteCount =
                                        voteRepository.countByOptionId(
                                                option.getId()
                                        );

                                double percentage = 0.0;

                                if (totalVotes > 0) {
                                    percentage =
                                            (voteCount * 100.0)
                                                    / totalVotes;
                                }

                                return new VoteResult(
                                        option.getId(),
                                        option.getOptionText(),
                                        voteCount,
                                        percentage
                                );
                            })
                            .toList();

            return ResponseEntity.ok(results);

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================
    // ADMIN - STUDENT VOTING DETAILS
    // =========================

    @GetMapping("/admin/results/{pollId}")
    public ResponseEntity<?> getAdminResults(
            @PathVariable Long pollId) {

        try {

            pollRepository.findById(pollId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Poll not found"
                            ));

            List<Vote> votes =
                    voteRepository.findByPollId(pollId);

            List<AdminVoteResponse> results =
                    new ArrayList<>();

            for (Vote vote : votes) {

                User user = vote.getUser();
                PollOption option = vote.getOption();

                AdminVoteResponse result =
                        new AdminVoteResponse();

                result.setStudentId(user.getId());
                result.setStudentName(user.getName());
                result.setEmail(user.getEmail());

                result.setOptionId(option.getId());
                result.setOptionText(option.getOptionText());

                result.setVotedAt(vote.getVotedAt());

                results.add(result);
            }

            return ResponseEntity.ok(results);

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================
    // ADMIN RESULT RESPONSE
    // =========================

    public static class AdminVoteResponse {

        private Long studentId;

        private String studentName;

        private String email;

        private Long optionId;

        private String optionText;

        private LocalDateTime votedAt;


        public Long getStudentId() {
            return studentId;
        }

        public void setStudentId(Long studentId) {
            this.studentId = studentId;
        }


        public String getStudentName() {
            return studentName;
        }

        public void setStudentName(String studentName) {
            this.studentName = studentName;
        }


        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }


        public Long getOptionId() {
            return optionId;
        }

        public void setOptionId(Long optionId) {
            this.optionId = optionId;
        }


        public String getOptionText() {
            return optionText;
        }

        public void setOptionText(String optionText) {
            this.optionText = optionText;
        }


        public LocalDateTime getVotedAt() {
            return votedAt;
        }

        public void setVotedAt(LocalDateTime votedAt) {
            this.votedAt = votedAt;
        }
    }
}