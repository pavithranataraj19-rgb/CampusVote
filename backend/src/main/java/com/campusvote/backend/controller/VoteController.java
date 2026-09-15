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
import java.time.ZoneId;
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

    // Always use India Standard Time for CampusVote
    private static final ZoneId INDIA_ZONE = ZoneId.of("Asia/Kolkata");

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

    // =========================================================
    // SUBMIT VOTE
    // =========================================================

    @PostMapping
    public ResponseEntity<?> submitVote(@RequestBody VoteRequest request) {

        try {

            // -------------------------------------------------
            // 1. Check user
            // -------------------------------------------------

            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() ->
                            new RuntimeException("User not found"));

            // -------------------------------------------------
            // 2. Check poll
            // -------------------------------------------------

            Poll poll = pollRepository.findById(request.getPollId())
                    .orElseThrow(() ->
                            new RuntimeException("Poll not found"));

            // -------------------------------------------------
            // 3. Prevent duplicate voting
            // -------------------------------------------------

            boolean alreadyVoted =
                    voteRepository.existsByUserIdAndPollId(
                            request.getUserId(),
                            request.getPollId()
                    );

            if (alreadyVoted) {

                return ResponseEntity.badRequest()
                        .body("You have already voted in this poll.");
            }

            // -------------------------------------------------
            // 4. Check whether poll is active
            // -------------------------------------------------

            if (!poll.isActive()) {

                return ResponseEntity.badRequest()
                        .body("This poll is currently closed.");
            }

            // -------------------------------------------------
            // 5. Get CURRENT INDIA TIME
            // -------------------------------------------------

            LocalDateTime now = LocalDateTime.now(INDIA_ZONE);

            // -------------------------------------------------
            // 6. Check poll start time
            // -------------------------------------------------

            if (poll.getStartDate() != null &&
                    now.isBefore(poll.getStartDate())) {

                return ResponseEntity.badRequest()
                        .body("This poll has not started yet.");
            }

            // -------------------------------------------------
            // 7. Check poll end time
            // -------------------------------------------------

            if (poll.getEndDate() != null &&
                    now.isAfter(poll.getEndDate())) {

                return ResponseEntity.badRequest()
                        .body("This poll has ended.");
            }

            // -------------------------------------------------
            // 8. Check selected option
            // -------------------------------------------------

            PollOption option =
                    pollOptionRepository.findById(request.getOptionId())
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Poll option not found"
                                    ));

            // -------------------------------------------------
            // 9. Make sure option belongs to this poll
            // -------------------------------------------------

            if (option.getPoll() == null ||
                    !option.getPoll()
                            .getId()
                            .equals(poll.getId())) {

                return ResponseEntity.badRequest()
                        .body("Invalid option for this poll.");
            }

            // -------------------------------------------------
            // 10. Create vote
            // -------------------------------------------------

            Vote vote = new Vote();

            vote.setUser(user);
            vote.setPoll(poll);
            vote.setOption(option);

            // Save voting time in India time
            vote.setVotedAt(LocalDateTime.now(INDIA_ZONE));

            // -------------------------------------------------
            // 11. Save vote
            // -------------------------------------------------

            voteRepository.save(vote);

            // -------------------------------------------------
            // 12. Success
            // -------------------------------------------------

            return ResponseEntity.ok(
                    "Vote submitted successfully."
            );

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // CHECK WHETHER USER ALREADY VOTED
    // =========================================================

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


    // =========================================================
    // GET USER'S SELECTED OPTION
    // =========================================================

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
                    vote.get()
                            .getOption()
                            .getId()
            );

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // GET POLL RESULTS
    // =========================================================

    @GetMapping("/results/{pollId}")
    public ResponseEntity<?> getResults(
            @PathVariable Long pollId) {

        try {

            // -------------------------------------------------
            // 1. Check poll exists
            // -------------------------------------------------

            pollRepository.findById(pollId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Poll not found"
                            ));

            // -------------------------------------------------
            // 2. Get options
            // -------------------------------------------------

            List<PollOption> options =
                    pollOptionRepository.findByPollId(pollId);

            // -------------------------------------------------
            // 3. Get total votes
            // -------------------------------------------------

            long totalVotes =
                    voteRepository.countByPollId(pollId);

            // -------------------------------------------------
            // 4. Calculate results
            // -------------------------------------------------

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


    // =========================================================
    // ADMIN - STUDENT VOTING DETAILS
    // =========================================================

    @GetMapping("/admin/results/{pollId}")
    public ResponseEntity<?> getAdminResults(
            @PathVariable Long pollId) {

        try {

            // -------------------------------------------------
            // 1. Check poll exists
            // -------------------------------------------------

            pollRepository.findById(pollId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Poll not found"
                            ));

            // -------------------------------------------------
            // 2. Get all votes
            // -------------------------------------------------

            List<Vote> votes =
                    voteRepository.findByPollId(pollId);

            // -------------------------------------------------
            // 3. Prepare response
            // -------------------------------------------------

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


    // =========================================================
    // ADMIN RESULT RESPONSE CLASS
    // =========================================================

    public static class AdminVoteResponse {

        private Long studentId;

        private String studentName;

        private String email;

        private Long optionId;

        private String optionText;

        private LocalDateTime votedAt;


        // -------------------------------------------------
        // Student ID
        // -------------------------------------------------

        public Long getStudentId() {
            return studentId;
        }

        public void setStudentId(Long studentId) {
            this.studentId = studentId;
        }


        // -------------------------------------------------
        // Student Name
        // -------------------------------------------------

        public String getStudentName() {
            return studentName;
        }

        public void setStudentName(String studentName) {
            this.studentName = studentName;
        }


        // -------------------------------------------------
        // Email
        // -------------------------------------------------

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }


        // -------------------------------------------------
        // Option ID
        // -------------------------------------------------

        public Long getOptionId() {
            return optionId;
        }

        public void setOptionId(Long optionId) {
            this.optionId = optionId;
        }


        // -------------------------------------------------
        // Option Text
        // -------------------------------------------------

        public String getOptionText() {
            return optionText;
        }

        public void setOptionText(String optionText) {
            this.optionText = optionText;
        }


        // -------------------------------------------------
        // Voted At
        // -------------------------------------------------

        public LocalDateTime getVotedAt() {
            return votedAt;
        }

        public void setVotedAt(LocalDateTime votedAt) {
            this.votedAt = votedAt;
        }
    }
}