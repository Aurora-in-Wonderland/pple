import instance from "./common";

// 댓글 조회
export const getComments = async (postId: string | undefined, page: number) => {
    const response = await instance.get(`api/posts/${postId}/comments`,
        { params: { page, size: 5 } }
    )
    return response;
}

// 댓글 작성
export const postComment = async (postId: string, body: { content: string | undefined }) => {
    const response = await instance.post(`api/posts/${postId}/comments`, body)
    return response;
}

// 댓글 수정
export const updateComment = async (commentId: string, body: { content: string | undefined }) => {
    const response = await instance.put(`api/comments/${commentId}`, body)
    return response;
}

// 댓글 삭제
export const deleteComment = async (commentId: string) => {
    const response = await instance.delete(`api/comments/${commentId}`)
    return response;
}